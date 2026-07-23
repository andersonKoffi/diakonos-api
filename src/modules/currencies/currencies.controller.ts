import {
  Body,
  Controller,
  Get,
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
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyResponseDto } from './dto/currency-response.dto';

@ApiTags('Devises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les devises disponibles (référentiel global)',
  })
  findAll(): Promise<CurrencyResponseDto[]> {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une devise" })
  @ApiResponse({ status: 200, type: CurrencyResponseDto })
  @ApiResponse({ status: 404, description: 'Devise introuvable' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CurrencyResponseDto> {
    return this.currenciesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une devise' })
  @ApiResponse({ status: 201, type: CurrencyResponseDto })
  create(@Body() dto: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    return this.currenciesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une devise (ou la désactiver via isActive: false)',
  })
  @ApiResponse({ status: 200, type: CurrencyResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    return this.currenciesService.update(id, dto);
  }
}
