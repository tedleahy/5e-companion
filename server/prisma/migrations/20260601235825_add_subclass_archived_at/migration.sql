-- AlterTable
ALTER TABLE "Subclass" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Subclass_archivedAt_idx" ON "Subclass"("archivedAt");
