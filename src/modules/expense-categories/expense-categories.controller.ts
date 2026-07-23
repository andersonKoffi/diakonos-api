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
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoryResponseDto } from './dto/expense-category-response.dto';

@ApiTags('Catégories de dépense')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "Lister les catégories de dépense de l'église de l'utilisateur connecté",
  })
  findAll(): Promise<ExpenseCategoryResponseDto[]> {
    return this.expenseCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une catégorie de dépense" })
  @ApiResponse({ status: 200, type: ExpenseCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseCategoryResponseDto> {
    return this.expenseCategoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une catégorie de dépense' })
  @ApiResponse({ status: 201, type: ExpenseCategoryResponseDto })
  create(
    @Body() dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategoryResponseDto> {
    return this.expenseCategoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une catégorie de dépense' })
  @ApiResponse({ status: 200, type: ExpenseCategoryResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategoryResponseDto> {
    return this.expenseCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer une catégorie de dépense' })
  @ApiResponse({ status: 204, description: 'Supprimé' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.expenseCategoriesService.remove(id);
  }
}
