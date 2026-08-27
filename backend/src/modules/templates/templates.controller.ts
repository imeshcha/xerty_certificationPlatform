import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/create-template.dto';

@ApiTags('Certificate Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new certificate canvas template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Get('issuer/:issuerId')
  @ApiOperation({ summary: 'List all templates for an issuer' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplatesByIssuer(@Param('issuerId') issuerId: string) {
    return this.templatesService.findAllByIssuer(issuerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplateById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template layout' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }
}
