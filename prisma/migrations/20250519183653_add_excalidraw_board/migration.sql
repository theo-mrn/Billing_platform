-- CreateTable
CREATE TABLE "ExcalidrawBoard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcalidrawBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExcalidrawBoard_projectId_idx" ON "ExcalidrawBoard"("projectId");

-- AddForeignKey
ALTER TABLE "ExcalidrawBoard" ADD CONSTRAINT "ExcalidrawBoard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
