-- CreateTable
CREATE TABLE "FeatPrerequisite" (
    "featId" TEXT NOT NULL,
    "abilityScoreId" TEXT NOT NULL,
    "minimumScore" INTEGER NOT NULL,

    CONSTRAINT "FeatPrerequisite_pkey" PRIMARY KEY ("featId","abilityScoreId"),
    CONSTRAINT "FeatPrerequisite_minimumScore_check" CHECK ("minimumScore" BETWEEN 1 AND 30)
);

-- CreateIndex
CREATE INDEX "FeatPrerequisite_abilityScoreId_idx" ON "FeatPrerequisite"("abilityScoreId");

-- AddForeignKey
ALTER TABLE "FeatPrerequisite" ADD CONSTRAINT "FeatPrerequisite_featId_fkey" FOREIGN KEY ("featId") REFERENCES "Feat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatPrerequisite" ADD CONSTRAINT "FeatPrerequisite_abilityScoreId_fkey" FOREIGN KEY ("abilityScoreId") REFERENCES "AbilityScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
