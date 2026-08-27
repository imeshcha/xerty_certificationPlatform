import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async syncUser(dto: SyncUserDto) {
    const user = await this.usersService.upsertUser({
      privyUserId: dto.privyUserId,
      walletAddress: dto.walletAddress,
      authProvider: dto.authProvider,
      email: dto.email,
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl,
      role: dto.role || UserRole.UNASSIGNED,
    });

    return {
      message: 'User synchronized successfully',
      user,
    };
  }

  async completeRegistration(dto: {
    userId?: string;
    walletAddress?: string;
    privyUserId?: string;
    role: UserRole;
    email?: string;
    fullName?: string;
    issuerProfile?: any;
    studentProfile?: any;
  }) {
    const user = await this.usersService.completeRegistration(dto);
    return {
      message: 'Registration completed successfully',
      user,
    };
  }
}
