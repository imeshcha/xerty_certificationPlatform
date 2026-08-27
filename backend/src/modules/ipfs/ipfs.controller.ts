import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';

@ApiTags('IPFS Storage')
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Post('pin-json')
  @ApiOperation({ summary: 'Pin certificate metadata JSON to IPFS' })
  @ApiResponse({ status: 201, description: 'Metadata pinned to IPFS successfully' })
  async pinJson(@Body() metadata: Record<string, any>) {
    return this.ipfsService.pinJSON(metadata);
  }

  @Get('gateway/:cid')
  @ApiOperation({ summary: 'Resolve IPFS CID to public gateway URL' })
  @ApiResponse({ status: 200, description: 'Gateway URL resolved' })
  async getGatewayUrl(@Param('cid') cid: string) {
    return {
      cid,
      uri: `ipfs://${cid}`,
      gatewayUrl: this.ipfsService.getGatewayUrl(cid),
    };
  }
}
