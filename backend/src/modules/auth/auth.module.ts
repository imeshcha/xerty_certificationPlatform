import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrivyAuthGuard } from './guards/privy-auth.guard';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, PrivyAuthGuard],
  exports: [AuthService, PrivyAuthGuard],
})
export class AuthModule {}
