CREATE TYPE "ClassSpellcastingMode" AS ENUM ('NONE', 'STANDARD', 'PACT_MAGIC');
CREATE TYPE "ClassProficiencyGrant" AS ENUM ('STARTING', 'MULTICLASS');

ALTER TABLE "Class"
ADD COLUMN "description" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "primaryAbilityIndexes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "savingThrowIndexes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "multiclassPrerequisites" JSONB,
ADD COLUMN "startingEquipment" JSONB,
ADD COLUMN "spellcastingMode" "ClassSpellcastingMode" NOT NULL DEFAULT 'NONE',
ADD COLUMN "addSpellcastingAbility" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emoji" TEXT NOT NULL DEFAULT '⚔️',
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE TABLE "ClassLevelProgression" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "abilityScoreImprovement" BOOLEAN NOT NULL DEFAULT false,
    "spellSlots" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "cantripsKnown" INTEGER,
    "spellsKnown" INTEGER,
    "preparedSpellCount" INTEGER,
    "classSpecific" JSONB,
    CONSTRAINT "ClassLevelProgression_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassProficiency" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "proficiencyId" TEXT NOT NULL,
    "grant" "ClassProficiencyGrant" NOT NULL,
    "choiceGroup" INTEGER,
    "choiceCount" INTEGER,
    CONSTRAINT "ClassProficiency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassSpell" (
    "classId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    CONSTRAINT "ClassSpell_pkey" PRIMARY KEY ("classId", "spellId")
);

CREATE UNIQUE INDEX "ClassLevelProgression_classId_level_key" ON "ClassLevelProgression"("classId", "level");
CREATE INDEX "ClassLevelProgression_classId_idx" ON "ClassLevelProgression"("classId");
CREATE UNIQUE INDEX "ClassProficiency_classId_proficiencyId_grant_key" ON "ClassProficiency"("classId", "proficiencyId", "grant");
CREATE INDEX "ClassProficiency_classId_grant_idx" ON "ClassProficiency"("classId", "grant");
CREATE INDEX "ClassProficiency_proficiencyId_idx" ON "ClassProficiency"("proficiencyId");
CREATE INDEX "ClassSpell_spellId_idx" ON "ClassSpell"("spellId");
CREATE INDEX "Class_archivedAt_idx" ON "Class"("archivedAt");

ALTER TABLE "ClassLevelProgression" ADD CONSTRAINT "ClassLevelProgression_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassProficiency" ADD CONSTRAINT "ClassProficiency_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassProficiency" ADD CONSTRAINT "ClassProficiency_proficiencyId_fkey" FOREIGN KEY ("proficiencyId") REFERENCES "Proficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
