import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record on-chain transaction' })
  @ApiResponse({ status: 201, description: 'Transaction recorded successfully' })
  async recordTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get(':txHash')
  @ApiOperation({ summary: 'Get transaction by hash' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  async getTransactionByHash(@Param('txHash') txHash: string) {
    return this.transactionsService.findByHash(txHash);
  }

  @Get('issuer/:issuerId')
  @ApiOperation({ summary: 'Get transactions by issuer ID' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactionsByIssuer(@Param('issuerId') issuerId: string) {
    return this.transactionsService.findByIssuer(issuerId);
  }
}
