import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize user after Privy social/wallet login' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@Body() syncUserDto: SyncUserDto) {
    return this.authService.syncUser(syncUserDto);
  }

  @Post('complete-registration')
  @ApiOperation({ summary: 'Finalize account creation, save profile details, and permanently lock role' })
  @ApiResponse({ status: 200, description: 'Account created and profile saved successfully' })
  async completeRegistration(
    @Body()
    body: {
      userId?: string;
      walletAddress?: string;
      privyUserId?: string;
      role: UserRole;
      email?: string;
      fullName?: string;
      issuerProfile?: any;
      studentProfile?: any;
    },
  ) {
    return this.authService.completeRegistration(body);
  }
}
