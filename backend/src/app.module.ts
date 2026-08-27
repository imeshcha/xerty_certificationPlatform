import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IssuersModule } from './modules/issuers/issuers.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BatchesModule } from './modules/batches/batches.module';
import { VerificationModule } from './modules/verification/verification.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    IssuersModule,
    StudentsModule,
    CoursesModule,
    TemplatesModule,
    CertificatesModule,
    TransactionsModule,
    BatchesModule,
    VerificationModule,
    BlockchainModule,
    IpfsModule,
  ],
})
export class AppModule {}
