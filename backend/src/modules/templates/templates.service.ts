import { Injectable } from '@nestjs/common';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/create-template.dto';

const DEFAULT_TEMPLATES = [
  {
    _id: 'tpl-classic-gold',
    name: 'Classic Gold Diploma',
    orientation: 'LANDSCAPE',
    bgImageIpfsCid: 'QmSampleGoldClassicCID',
    bgImageUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleGoldClassicCID',
    canvasLayoutJson: '{"title":{"x":50,"y":30},"student":{"x":50,"y":50}}',
    isActive: true,
  },
  {
    _id: 'tpl-modern-web3',
    name: 'Modern Web3 Dark',
    orientation: 'LANDSCAPE',
    bgImageIpfsCid: 'QmSampleModernWeb3CID',
    bgImageUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleModernWeb3CID',
    canvasLayoutJson: '{"title":{"x":50,"y":30},"student":{"x":50,"y":50}}',
    isActive: true,
  },
  {
    _id: 'tpl-executive-tech',
    name: 'Executive Technical',
    orientation: 'LANDSCAPE',
    bgImageIpfsCid: 'QmSampleExecTechCID',
    bgImageUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleExecTechCID',
    canvasLayoutJson: '{"title":{"x":50,"y":30},"student":{"x":50,"y":50}}',
    isActive: true,
  },
];

@Injectable()
export class TemplatesService {
  async findAllByIssuer(issuerId: string): Promise<any[]> {
    return DEFAULT_TEMPLATES;
  }

  async findById(id: string): Promise<any> {
    const found = DEFAULT_TEMPLATES.find((t) => t._id === id);
    return (
      found || {
        _id: id,
        name: 'Custom Diploma Template',
        orientation: 'LANDSCAPE',
        bgImageIpfsCid: 'QmSampleDefaultCID',
        bgImageUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleDefaultCID',
        canvasLayoutJson: '{}',
        isActive: true,
      }
    );
  }

  async create(dto: CreateTemplateDto): Promise<any> {
    return {
      _id: `tpl-${Date.now()}`,
      ...dto,
      isActive: true,
    };
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<any> {
    return {
      _id: id,
      ...dto,
    };
  }
}
