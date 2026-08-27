import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create student profile' })
  @ApiResponse({ status: 201, description: 'Student profile created successfully' })
  async createProfile(@Body() dto: CreateStudentProfileDto) {
    return this.studentsService.create(dto);
  }

  @Get('profile/user/:userId')
  @ApiOperation({ summary: 'Get student profile by user ID' })
  @ApiResponse({ status: 200, description: 'Student profile retrieved successfully' })
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.studentsService.findByUserId(userId);
  }

  @Patch('profile/user/:userId')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({ status: 200, description: 'Student profile updated successfully' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.update(userId, dto);
  }

  @Post('claim/:certificateId/user/:userId')
  @ApiOperation({ summary: 'Claim certificate into student profile' })
  @ApiResponse({ status: 200, description: 'Certificate claimed into student portfolio' })
  async claimCertificate(
    @Param('userId') userId: string,
    @Param('certificateId') certificateId: string,
  ) {
    return this.studentsService.claimCertificate(userId, certificateId);
  }
}
