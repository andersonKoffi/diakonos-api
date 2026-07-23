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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';

@ApiTags('Frais de note')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({
    summary: "Lister les frais de l'église de l'utilisateur connecté",
  })
  findAll(@Query() query: ListExpensesQueryDto) {
    return this.expensesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un frais" })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: 'Frais introuvable' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un frais de note (statut brouillon)' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  create(@Body() dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    return this.expensesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un frais de note (réservé au statut brouillon)',
  })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({ status: 400, description: "Le frais n'est plus un brouillon" })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Supprimer un frais de note (réservé au statut brouillon)',
  })
  @ApiResponse({ status: 204, description: 'Supprimé' })
  @ApiResponse({ status: 400, description: "Le frais n'est plus un brouillon" })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.expensesService.remove(id);
  }

  @Patch(':id/submit')
  @ApiOperation({
    summary: 'Soumettre le frais pour validation (DRAFT → SUBMITTED)',
  })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  submit(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponseDto> {
    return this.expensesService.submit(id);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Valider le frais (SUBMITTED → APPROVED)',
    description:
      'Au-delà de 100 000 XOF, le validateur doit être différent du demandeur.',
  })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({ status: 403, description: 'Auto-validation interdite' })
  approve(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponseDto> {
    return this.expensesService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Rejeter le frais avec motif (SUBMITTED → REJECTED)',
  })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.reject(id, dto.reason);
  }

  @Patch(':id/pay')
  @ApiOperation({
    summary: 'Marquer le frais comme remboursé (APPROVED → PAID)',
  })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  markPaid(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.markPaid(id);
  }
}
