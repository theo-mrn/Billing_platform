-- CreateTable
CREATE TABLE "RichTextContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RichTextContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RichTextContent_projectId_idx" ON "RichTextContent"("projectId");

-- AddForeignKey
ALTER TABLE "RichTextContent" ADD CONSTRAINT "RichTextContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
