-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "KanbanTask" ADD COLUMN     "lastRecurrence" TIMESTAMP(3),
ADD COLUMN     "recurrenceType" "RecurrenceType" NOT NULL DEFAULT 'NONE';
