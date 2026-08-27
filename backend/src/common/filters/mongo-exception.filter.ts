import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { mongo } from 'mongoose';

@Catch(mongo.MongoError, mongo.MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: mongo.MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let errorName = 'DatabaseError';

    // Handle E11000 Duplicate Key Error
    if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      errorName = 'DuplicateKeyError';
      const duplicateField = Object.keys(exception.keyPattern || {})[0] || 'field';
      const duplicateValue = exception.keyValue ? exception.keyValue[duplicateField] : '';
      message = `A record with ${duplicateField} '${duplicateValue}' already exists.`;
    }

    this.logger.warn(
      `[${request.method}] ${request.url} - MongoDB Error (${exception.code}): ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message: [message],
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
