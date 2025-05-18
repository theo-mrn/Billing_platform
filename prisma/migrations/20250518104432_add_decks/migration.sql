/*
  Warnings:

  - Added the required column `deckId` to the `Flashcard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "deckId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deck_projectId_idx" ON "Deck"("projectId");

-- CreateIndex
CREATE INDEX "Flashcard_deckId_idx" ON "Flashcard"("deckId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
