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

-- Create default decks for existing projects
INSERT INTO "Deck" ("id", "name", "description", "projectId", "createdAt", "updatedAt")
SELECT 
    'default_' || "id",
    'Default Deck',
    'Default deck created during migration',
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Project";

-- CreateIndex
CREATE INDEX "Deck_projectId_idx" ON "Deck"("projectId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN "deckId" TEXT;

-- Update existing flashcards to use default decks
UPDATE "Flashcard"
SET "deckId" = 'default_' || "projectId"
WHERE "deckId" IS NULL;

-- Make deckId required
ALTER TABLE "Flashcard" ALTER COLUMN "deckId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Flashcard_deckId_idx" ON "Flashcard"("deckId");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE; 