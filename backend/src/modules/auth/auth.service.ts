import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SyncUserDto } from './dto/sync-user.dto';

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
      role: dto.role || 'STUDENT',
    });

    return {
      message: 'User synchronized successfully',
      user,
    };
  }
}
