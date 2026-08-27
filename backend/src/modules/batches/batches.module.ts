import { Module } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { CertificatesModule } from '../certificates/certificates.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { CoursesModule } from '../courses/courses.module';
import { IssuersModule } from '../issuers/issuers.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    CertificatesModule,
    IpfsModule,
    CoursesModule,
    IssuersModule,
    TemplatesModule,
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
