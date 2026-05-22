-- AlterTable
ALTER TABLE "Feature"
ADD COLUMN "parentFeatureId" TEXT,
ADD COLUMN "chooseCount" INTEGER;

-- CreateIndex
CREATE INDEX "Feature_parentFeatureId_idx" ON "Feature"("parentFeatureId");

-- AddForeignKey
ALTER TABLE "Feature"
ADD CONSTRAINT "Feature_parentFeatureId_fkey"
FOREIGN KEY ("parentFeatureId") REFERENCES "Feature"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
