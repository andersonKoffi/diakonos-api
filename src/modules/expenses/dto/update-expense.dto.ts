import { CreateExpenseDto } from './create-expense.dto';

/**
 * Même forme que la création : le front renvoie toujours l'état complet du
 * formulaire (pas de patch partiel). Réservé aux frais en statut DRAFT.
 */
export class UpdateExpenseDto extends CreateExpenseDto {}
