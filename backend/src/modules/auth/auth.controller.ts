import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';

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
}
