import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundResponseDto } from './dto/fund-response.dto';

@ApiTags('Fonds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get()
  @ApiOperation({
    summary: "Lister les fonds de l'église de l'utilisateur connecté",
  })
  findAll(): Promise<FundResponseDto[]> {
    return this.fundsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un fonds" })
  @ApiResponse({ status: 200, type: FundResponseDto })
  @ApiResponse({ status: 404, description: 'Fonds introuvable' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FundResponseDto> {
    return this.fundsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un fonds' })
  @ApiResponse({ status: 201, type: FundResponseDto })
  create(@Body() dto: CreateFundDto): Promise<FundResponseDto> {
    return this.fundsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un fonds' })
  @ApiResponse({ status: 200, type: FundResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFundDto,
  ): Promise<FundResponseDto> {
    return this.fundsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un fonds' })
  @ApiResponse({ status: 204, description: 'Supprimé' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.fundsService.remove(id);
  }
}
