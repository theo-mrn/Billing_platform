-- AlterTable
ALTER TABLE "RichTextContent" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "TextFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "lastReviewed" TIMESTAMP(3) NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TextFolder_projectId_idx" ON "TextFolder"("projectId");

-- CreateIndex
CREATE INDEX "TextFolder_parentId_idx" ON "TextFolder"("parentId");

-- CreateIndex
CREATE INDEX "Flashcard_projectId_idx" ON "Flashcard"("projectId");

-- CreateIndex
CREATE INDEX "FlashcardProgress_userId_idx" ON "FlashcardProgress"("userId");

-- CreateIndex
CREATE INDEX "FlashcardProgress_flashcardId_idx" ON "FlashcardProgress"("flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardProgress_userId_flashcardId_key" ON "FlashcardProgress"("userId", "flashcardId");

-- CreateIndex
CREATE INDEX "RichTextContent_folderId_idx" ON "RichTextContent"("folderId");

-- AddForeignKey
ALTER TABLE "RichTextContent" ADD CONSTRAINT "RichTextContent_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "TextFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextFolder" ADD CONSTRAINT "TextFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextFolder" ADD CONSTRAINT "TextFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TextFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
