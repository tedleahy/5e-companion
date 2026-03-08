-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subclass" TEXT,
    "level" INTEGER NOT NULL,
    "alignment" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "proficiencyBonus" INTEGER NOT NULL,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "ac" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "initiative" INTEGER NOT NULL,
    "spellcastingAbility" TEXT,
    "spellSaveDC" INTEGER,
    "spellAttackBonus" INTEGER,
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStats" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "abilityScores" JSONB NOT NULL,
    "hp" JSONB NOT NULL,
    "deathSaves" JSONB NOT NULL,
    "hitDice" JSONB NOT NULL,
    "savingThrowProficiencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillProficiencies" JSONB NOT NULL,
    "traits" JSONB NOT NULL,
    "currency" JSONB NOT NULL,

    CONSTRAINT "CharacterStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attack" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attackBonus" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Attack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION,
    "description" TEXT,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "magical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterFeature" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usesMax" INTEGER,
    "usesRemaining" INTEGER,
    "recharge" TEXT,

    CONSTRAINT "CharacterFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellSlot" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpellSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterPreparedSpell" (
    "characterId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "prepared" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CharacterPreparedSpell_pkey" PRIMARY KEY ("characterId","spellId")
);

-- CreateIndex
CREATE INDEX "Character_ownerUserId_idx" ON "Character"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStats_characterId_key" ON "CharacterStats"("characterId");

-- CreateIndex
CREATE INDEX "Attack_characterId_idx" ON "Attack"("characterId");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE INDEX "CharacterFeature_characterId_idx" ON "CharacterFeature"("characterId");

-- CreateIndex
CREATE INDEX "SpellSlot_characterId_idx" ON "SpellSlot"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SpellSlot_characterId_level_key" ON "SpellSlot"("characterId", "level");

-- AddForeignKey
ALTER TABLE "CharacterStats" ADD CONSTRAINT "CharacterStats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attack" ADD CONSTRAINT "Attack_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeature" ADD CONSTRAINT "CharacterFeature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellSlot" ADD CONSTRAINT "SpellSlot_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPreparedSpell" ADD CONSTRAINT "CharacterPreparedSpell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPreparedSpell" ADD CONSTRAINT "CharacterPreparedSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
