-- AlterTable
ALTER TABLE "funds" ADD COLUMN     "board_decision_ref" TEXT,
ADD COLUMN     "closed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goal" DECIMAL(18,2),
ADD COLUMN     "prudential_floor" DECIMAL(18,2);
