import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';

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
  @ApiResponse({ status: 200, type: [ExpenseResponseDto] })
  findAll(@Query() query: ListExpensesQueryDto) {
    return this.expensesService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un frais de note (statut brouillon)' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  create(@Body() dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    return this.expensesService.create(dto);
  }
}
