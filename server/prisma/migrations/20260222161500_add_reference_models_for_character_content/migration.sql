-- CreateEnum
CREATE TYPE "FeatureKind" AS ENUM ('CLASS_FEATURE', 'SUBCLASS_FEATURE', 'TRAIT_FEATURE', 'BACKGROUND_FEATURE', 'FEAT_FEATURE', 'CUSTOM_FEATURE');

-- CreateEnum
CREATE TYPE "ProficiencyType" AS ENUM ('ARMOR', 'WEAPON', 'TOOL', 'SKILL', 'SAVING_THROW', 'OTHER');

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "source",
ADD COLUMN     "ownerUserId" TEXT,
ADD COLUMN     "raw" JSONB,
ADD COLUMN     "sourceBook" TEXT,
ALTER COLUMN "speed" DROP NOT NULL,
ALTER COLUMN "alignment" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "sizeDescription" DROP NOT NULL,
ALTER COLUMN "languageDescription" DROP NOT NULL,
ALTER COLUMN "languageIndexes" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "traitIndexes" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "subraceIndexes" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "backgroundId" TEXT,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "raceId" TEXT,
ADD COLUMN     "subclassId" TEXT,
ADD COLUMN     "subraceId" TEXT;

-- AlterTable
ALTER TABLE "CharacterFeature" ADD COLUMN     "featureId" TEXT;

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "hitDie" INTEGER,
    "spellcastingAbility" TEXT,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subclass" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Subclass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Background" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "featureName" TEXT,
    "featureDescription" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languageChoiceCount" INTEGER,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languageChoiceCount" INTEGER,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subrace" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "raceId" TEXT NOT NULL,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Subrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feat" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Feat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "script" TEXT,
    "description" TEXT,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proficiency" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "type" "ProficiencyType" NOT NULL,
    "sourceBook" TEXT,
    "raw" JSONB,

    CONSTRAINT "Proficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "level" INTEGER,
    "kind" "FeatureKind" NOT NULL,
    "sourceLabel" TEXT,
    "sourceBook" TEXT,
    "raw" JSONB,
    "classId" TEXT,
    "subclassId" TEXT,
    "raceId" TEXT,
    "subraceId" TEXT,
    "backgroundId" TEXT,
    "traitId" TEXT,
    "featId" TEXT,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterFeat" (
    "characterId" TEXT NOT NULL,
    "featId" TEXT NOT NULL,

    CONSTRAINT "CharacterFeat_pkey" PRIMARY KEY ("characterId","featId")
);

-- CreateTable
CREATE TABLE "CharacterLanguage" (
    "characterId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "CharacterLanguage_pkey" PRIMARY KEY ("characterId","languageId")
);

-- CreateTable
CREATE TABLE "CharacterProficiency" (
    "characterId" TEXT NOT NULL,
    "proficiencyId" TEXT NOT NULL,

    CONSTRAINT "CharacterProficiency_pkey" PRIMARY KEY ("characterId","proficiencyId")
);

-- CreateTable
CREATE TABLE "_RaceTraits" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RaceTraits_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassProficiencies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassProficiencies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BackgroundProficiencies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BackgroundProficiencies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BackgroundLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BackgroundLanguages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SubraceTraits" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubraceTraits_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RaceLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RaceLanguages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TraitLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TraitLanguages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TraitProficiencies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TraitProficiencies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_srdIndex_key" ON "Class"("srdIndex");

-- CreateIndex
CREATE INDEX "Class_ownerUserId_idx" ON "Class"("ownerUserId");

-- CreateIndex
CREATE INDEX "Class_name_idx" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subclass_srdIndex_key" ON "Subclass"("srdIndex");

-- CreateIndex
CREATE INDEX "Subclass_ownerUserId_idx" ON "Subclass"("ownerUserId");

-- CreateIndex
CREATE INDEX "Subclass_classId_idx" ON "Subclass"("classId");

-- CreateIndex
CREATE INDEX "Subclass_name_idx" ON "Subclass"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Background_srdIndex_key" ON "Background"("srdIndex");

-- CreateIndex
CREATE INDEX "Background_ownerUserId_idx" ON "Background"("ownerUserId");

-- CreateIndex
CREATE INDEX "Background_name_idx" ON "Background"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_srdIndex_key" ON "Trait"("srdIndex");

-- CreateIndex
CREATE INDEX "Trait_ownerUserId_idx" ON "Trait"("ownerUserId");

-- CreateIndex
CREATE INDEX "Trait_name_idx" ON "Trait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subrace_srdIndex_key" ON "Subrace"("srdIndex");

-- CreateIndex
CREATE INDEX "Subrace_ownerUserId_idx" ON "Subrace"("ownerUserId");

-- CreateIndex
CREATE INDEX "Subrace_raceId_idx" ON "Subrace"("raceId");

-- CreateIndex
CREATE INDEX "Subrace_name_idx" ON "Subrace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feat_srdIndex_key" ON "Feat"("srdIndex");

-- CreateIndex
CREATE INDEX "Feat_ownerUserId_idx" ON "Feat"("ownerUserId");

-- CreateIndex
CREATE INDEX "Feat_name_idx" ON "Feat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_srdIndex_key" ON "Language"("srdIndex");

-- CreateIndex
CREATE INDEX "Language_ownerUserId_idx" ON "Language"("ownerUserId");

-- CreateIndex
CREATE INDEX "Language_name_idx" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Proficiency_srdIndex_key" ON "Proficiency"("srdIndex");

-- CreateIndex
CREATE INDEX "Proficiency_ownerUserId_idx" ON "Proficiency"("ownerUserId");

-- CreateIndex
CREATE INDEX "Proficiency_name_idx" ON "Proficiency"("name");

-- CreateIndex
CREATE INDEX "Proficiency_type_idx" ON "Proficiency"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_srdIndex_key" ON "Feature"("srdIndex");

-- CreateIndex
CREATE INDEX "Feature_ownerUserId_idx" ON "Feature"("ownerUserId");

-- CreateIndex
CREATE INDEX "Feature_name_idx" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "Feature_kind_idx" ON "Feature"("kind");

-- CreateIndex
CREATE INDEX "Feature_classId_idx" ON "Feature"("classId");

-- CreateIndex
CREATE INDEX "Feature_subclassId_idx" ON "Feature"("subclassId");

-- CreateIndex
CREATE INDEX "Feature_raceId_idx" ON "Feature"("raceId");

-- CreateIndex
CREATE INDEX "Feature_subraceId_idx" ON "Feature"("subraceId");

-- CreateIndex
CREATE INDEX "Feature_backgroundId_idx" ON "Feature"("backgroundId");

-- CreateIndex
CREATE INDEX "Feature_traitId_idx" ON "Feature"("traitId");

-- CreateIndex
CREATE INDEX "Feature_featId_idx" ON "Feature"("featId");

-- CreateIndex
CREATE INDEX "_RaceTraits_B_index" ON "_RaceTraits"("B");

-- CreateIndex
CREATE INDEX "_ClassProficiencies_B_index" ON "_ClassProficiencies"("B");

-- CreateIndex
CREATE INDEX "_BackgroundProficiencies_B_index" ON "_BackgroundProficiencies"("B");

-- CreateIndex
CREATE INDEX "_BackgroundLanguages_B_index" ON "_BackgroundLanguages"("B");

-- CreateIndex
CREATE INDEX "_SubraceTraits_B_index" ON "_SubraceTraits"("B");

-- CreateIndex
CREATE INDEX "_RaceLanguages_B_index" ON "_RaceLanguages"("B");

-- CreateIndex
CREATE INDEX "_TraitLanguages_B_index" ON "_TraitLanguages"("B");

-- CreateIndex
CREATE INDEX "_TraitProficiencies_B_index" ON "_TraitProficiencies"("B");

-- CreateIndex
CREATE INDEX "Race_ownerUserId_idx" ON "Race"("ownerUserId");

-- CreateIndex
CREATE INDEX "Race_name_idx" ON "Race"("name");

-- CreateIndex
CREATE INDEX "Character_classId_idx" ON "Character"("classId");

-- CreateIndex
CREATE INDEX "Character_subclassId_idx" ON "Character"("subclassId");

-- CreateIndex
CREATE INDEX "Character_raceId_idx" ON "Character"("raceId");

-- CreateIndex
CREATE INDEX "Character_subraceId_idx" ON "Character"("subraceId");

-- CreateIndex
CREATE INDEX "Character_backgroundId_idx" ON "Character"("backgroundId");

-- CreateIndex
CREATE INDEX "CharacterFeature_featureId_idx" ON "CharacterFeature"("featureId");

-- AddForeignKey
ALTER TABLE "Subclass" ADD CONSTRAINT "Subclass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subrace" ADD CONSTRAINT "Subrace_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "Subclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_subraceId_fkey" FOREIGN KEY ("subraceId") REFERENCES "Subrace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_featId_fkey" FOREIGN KEY ("featId") REFERENCES "Feat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "Subclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_subraceId_fkey" FOREIGN KEY ("subraceId") REFERENCES "Subrace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeature" ADD CONSTRAINT "CharacterFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeat" ADD CONSTRAINT "CharacterFeat_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeat" ADD CONSTRAINT "CharacterFeat_featId_fkey" FOREIGN KEY ("featId") REFERENCES "Feat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLanguage" ADD CONSTRAINT "CharacterLanguage_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLanguage" ADD CONSTRAINT "CharacterLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterProficiency" ADD CONSTRAINT "CharacterProficiency_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterProficiency" ADD CONSTRAINT "CharacterProficiency_proficiencyId_fkey" FOREIGN KEY ("proficiencyId") REFERENCES "Proficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RaceTraits" ADD CONSTRAINT "_RaceTraits_A_fkey" FOREIGN KEY ("A") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RaceTraits" ADD CONSTRAINT "_RaceTraits_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassProficiencies" ADD CONSTRAINT "_ClassProficiencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassProficiencies" ADD CONSTRAINT "_ClassProficiencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Proficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundProficiencies" ADD CONSTRAINT "_BackgroundProficiencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Background"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundProficiencies" ADD CONSTRAINT "_BackgroundProficiencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Proficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundLanguages" ADD CONSTRAINT "_BackgroundLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "Background"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundLanguages" ADD CONSTRAINT "_BackgroundLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubraceTraits" ADD CONSTRAINT "_SubraceTraits_A_fkey" FOREIGN KEY ("A") REFERENCES "Subrace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubraceTraits" ADD CONSTRAINT "_SubraceTraits_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RaceLanguages" ADD CONSTRAINT "_RaceLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RaceLanguages" ADD CONSTRAINT "_RaceLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TraitLanguages" ADD CONSTRAINT "_TraitLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TraitLanguages" ADD CONSTRAINT "_TraitLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TraitProficiencies" ADD CONSTRAINT "_TraitProficiencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Proficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TraitProficiencies" ADD CONSTRAINT "_TraitProficiencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

