import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { SingleIssueDto } from './dto/single-issue.dto';
import { ProcessBatchDto, ParseFileContentDto } from './dto/process-batch.dto';

@ApiTags('Issuance & Batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post('single-issue')
  @ApiOperation({ summary: 'Issue a single certificate manually' })
  @ApiResponse({ status: 201, description: 'Certificate issued successfully' })
  async singleIssue(@Body() dto: SingleIssueDto) {
    return this.batchesService.singleIssue(dto);
  }

  @Post('parse-file')
  @ApiOperation({ summary: 'Parse CSV/Excel file and validate row data' })
  @ApiResponse({ status: 200, description: 'File parsed and validated' })
  async parseFile(@Body() dto: ParseFileContentDto) {
    return this.batchesService.parseFileContent(dto);
  }

  @Post('process')
  @ApiOperation({ summary: 'Process bulk certificate issuance cohort' })
  @ApiResponse({ status: 201, description: 'Batch processing executed' })
  async processBatch(@Body() dto: ProcessBatchDto) {
    return this.batchesService.processBatch(dto);
  }

  @Get('issuer/:issuerId')
  @ApiOperation({ summary: 'Get all batches issued by institution' })
  @ApiResponse({ status: 200, description: 'Batches retrieved successfully' })
  async getBatchesByIssuer(@Param('issuerId') issuerId: string) {
    return this.batchesService.getBatchesByIssuer(issuerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch details and row execution logs' })
  @ApiResponse({ status: 200, description: 'Batch retrieved successfully' })
  async getBatchById(@Param('id') id: string) {
    return this.batchesService.getBatchById(id);
  }
}
