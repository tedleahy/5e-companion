-- CreateTable
CREATE TABLE "SubraceAbilityBonus" (
    "subraceId" TEXT NOT NULL,
    "abilityScoreId" TEXT NOT NULL,
    "bonus" INTEGER NOT NULL,

    CONSTRAINT "SubraceAbilityBonus_pkey" PRIMARY KEY ("subraceId","abilityScoreId")
);

-- AddForeignKey
ALTER TABLE "SubraceAbilityBonus" ADD CONSTRAINT "SubraceAbilityBonus_subraceId_fkey" FOREIGN KEY ("subraceId") REFERENCES "Subrace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubraceAbilityBonus" ADD CONSTRAINT "SubraceAbilityBonus_abilityScoreId_fkey" FOREIGN KEY ("abilityScoreId") REFERENCES "AbilityScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
