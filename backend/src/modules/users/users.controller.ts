import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by MongoDB ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('wallet/:address')
  @ApiOperation({ summary: 'Get user by wallet address' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserByWallet(@Param('address') address: string) {
    return this.usersService.findByWallet(address);
  }

  @Patch('profile/issuer')
  @ApiOperation({ summary: 'Update issuer profile' })
  @ApiResponse({ status: 200, description: 'Issuer profile updated successfully' })
  async updateIssuerProfile(@Body() body: any) {
    return this.usersService.updateIssuerProfile(
      { userId: body.userId, walletAddress: body.walletAddress },
      {
        academyName: body.academyName,
        slug: body.slug,
        website: body.website,
        contactEmail: body.contactEmail,
        description: body.description,
      },
    );
  }

  @Patch('profile/student')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({ status: 200, description: 'Student profile updated successfully' })
  async updateStudentProfile(@Body() body: any) {
    return this.usersService.updateStudentProfile(
      { userId: body.userId, walletAddress: body.walletAddress },
      {
        fullName: body.fullName,
        headline: body.headline,
        bio: body.bio,
        linkedin: body.linkedin,
        github: body.github,
        twitter: body.twitter,
      },
    );
  }
}
