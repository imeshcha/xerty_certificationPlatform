import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token missing');
    }

    try {
      // In production, token is verified against Privy JWKS or via Privy Node SDK
      // Mock/development extraction for initial setup:
      const privyUserId = request.headers['x-privy-user-id'] as string;
      if (privyUserId) {
        const user = await this.usersService.findByPrivyId(privyUserId);
        if (user) {
          request.user = user;
          return true;
        }
      }

      // Default payload attachment
      request.user = {
        token,
        privyUserId: privyUserId || 'anonymous_privy_user',
        role: 'STUDENT',
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Privy session token');
    }
  }
}
