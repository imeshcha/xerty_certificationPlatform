import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getAllCourses() {
    return this.coursesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get('issuer/:issuerId')
  @ApiOperation({ summary: 'List all courses by issuer' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getCoursesByIssuer(@Param('issuerId') issuerId: string) {
    return this.coursesService.findAllByIssuer(issuerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course room' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}
