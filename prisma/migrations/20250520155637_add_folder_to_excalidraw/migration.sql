-- AlterTable
ALTER TABLE "ExcalidrawBoard" ADD COLUMN     "folderId" TEXT;

-- CreateIndex
CREATE INDEX "ExcalidrawBoard_folderId_idx" ON "ExcalidrawBoard"("folderId");

-- AddForeignKey
ALTER TABLE "ExcalidrawBoard" ADD CONSTRAINT "ExcalidrawBoard_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "TextFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
