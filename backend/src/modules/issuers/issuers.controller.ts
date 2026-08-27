import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IssuersService } from './issuers.service';
import { CreateIssuerProfileDto } from './dto/create-issuer-profile.dto';
import { UpdateIssuerProfileDto } from './dto/update-issuer-profile.dto';

@ApiTags('Issuers')
@Controller('issuers')
export class IssuersController {
  constructor(private readonly issuersService: IssuersService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create institutional issuer profile' })
  @ApiResponse({ status: 201, description: 'Issuer profile created successfully' })
  async createProfile(@Body() dto: CreateIssuerProfileDto) {
    return this.issuersService.create(dto);
  }

  @Get('profile/user/:userId')
  @ApiOperation({ summary: 'Get issuer profile by user ID' })
  @ApiResponse({ status: 200, description: 'Issuer profile retrieved successfully' })
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.issuersService.findByUserId(userId);
  }

  @Get('profile/slug/:slug')
  @ApiOperation({ summary: 'Get public academy profile by slug' })
  @ApiResponse({ status: 200, description: 'Issuer profile retrieved successfully' })
  async getProfileBySlug(@Param('slug') slug: string) {
    return this.issuersService.findBySlug(slug);
  }

  @Patch('profile/user/:userId')
  @ApiOperation({ summary: 'Update issuer profile' })
  @ApiResponse({ status: 200, description: 'Issuer profile updated successfully' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateIssuerProfileDto,
  ) {
    return this.issuersService.update(userId, dto);
  }
}
