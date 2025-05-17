/*
  Warnings:

  - You are about to drop the column `projectId` on the `KanbanStatus` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `KanbanStatus` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to drop the column `plannedEndDate` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `KanbanTask` table. All the data in the column will be lost.
  - Added the required column `boardId` to the `KanbanStatus` table without a default value. This is not possible if the table is not empty.
  - Made the column `color` on table `KanbanStatus` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `boardId` to the `KanbanTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KanbanStatus" DROP CONSTRAINT "KanbanStatus_projectId_fkey";

-- DropForeignKey
ALTER TABLE "KanbanTask" DROP CONSTRAINT "KanbanTask_projectId_fkey";

-- DropIndex
DROP INDEX "KanbanStatus_projectId_idx";

-- DropIndex
DROP INDEX "KanbanStatus_projectId_type_key";

-- DropIndex
DROP INDEX "KanbanTask_projectId_idx";

-- AlterTable
ALTER TABLE "KanbanStatus" DROP COLUMN "projectId",
DROP COLUMN "type",
ADD COLUMN     "boardId" TEXT NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'muted',
ALTER COLUMN "order" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanbanTask" DROP COLUMN "completedAt",
DROP COLUMN "groupName",
DROP COLUMN "plannedEndDate",
DROP COLUMN "projectId",
DROP COLUMN "startedAt",
ADD COLUMN     "actualEndAt" TIMESTAMP(3),
ADD COLUMN     "actualStartAt" TIMESTAMP(3),
ADD COLUMN     "boardId" TEXT NOT NULL,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "plannedEndAt" TIMESTAMP(3),
ADD COLUMN     "plannedStartAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "KanbanStatusType";

-- CreateTable
CREATE TABLE "KanbanBoard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "boardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KanbanBoard_projectId_idx" ON "KanbanBoard"("projectId");

-- CreateIndex
CREATE INDEX "KanbanGroup_boardId_idx" ON "KanbanGroup"("boardId");

-- CreateIndex
CREATE INDEX "KanbanStatus_boardId_idx" ON "KanbanStatus"("boardId");

-- CreateIndex
CREATE INDEX "KanbanTask_boardId_idx" ON "KanbanTask"("boardId");

-- CreateIndex
CREATE INDEX "KanbanTask_groupId_idx" ON "KanbanTask"("groupId");

-- AddForeignKey
ALTER TABLE "KanbanBoard" ADD CONSTRAINT "KanbanBoard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanStatus" ADD CONSTRAINT "KanbanStatus_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanGroup" ADD CONSTRAINT "KanbanGroup_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTask" ADD CONSTRAINT "KanbanTask_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTask" ADD CONSTRAINT "KanbanTask_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "KanbanGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
