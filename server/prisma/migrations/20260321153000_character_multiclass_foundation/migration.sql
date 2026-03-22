-- CreateEnum
CREATE TYPE "SpellSlotKind" AS ENUM ('STANDARD', 'PACT_MAGIC');

-- AlterTable
ALTER TABLE "SpellSlot"
ADD COLUMN "kind" "SpellSlotKind" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "CharacterClass" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassId" TEXT,
    "level" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "isStartingClass" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CharacterClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HitDicePool" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "die" TEXT NOT NULL,

    CONSTRAINT "HitDicePool_pkey" PRIMARY KEY ("id")
);

-- Backfill CharacterClass rows from the pre-refactor single-class columns.
WITH "ResolvedCharacterRows" AS (
    SELECT
        "Character"."id" AS "characterId",
        COALESCE("Character"."classId", "ResolvedClass"."id") AS "resolvedClassId",
        COALESCE("Character"."subclassId", "ResolvedSubclass"."id") AS "resolvedSubclassId",
        "Character"."level" AS "level"
    FROM "Character"
    LEFT JOIN "Class" AS "ResolvedClass"
        ON "ResolvedClass"."name" = "Character"."class"
    LEFT JOIN "Subclass" AS "ResolvedSubclass"
        ON "ResolvedSubclass"."name" = "Character"."subclass"
       AND "ResolvedSubclass"."classId" = COALESCE("Character"."classId", "ResolvedClass"."id")
)
INSERT INTO "CharacterClass" (
    "id",
    "characterId",
    "classId",
    "subclassId",
    "level",
    "order",
    "isStartingClass"
)
SELECT
    'cc_' || "ResolvedCharacterRows"."characterId",
    "ResolvedCharacterRows"."characterId",
    "ResolvedCharacterRows"."resolvedClassId",
    "ResolvedCharacterRows"."resolvedSubclassId",
    "ResolvedCharacterRows"."level",
    0,
    true
FROM "ResolvedCharacterRows"
WHERE "ResolvedCharacterRows"."resolvedClassId" IS NOT NULL;

-- Backfill one hit-dice pool per migrated starting-class row.
WITH "ResolvedCharacterRows" AS (
    SELECT
        "CharacterStats"."characterId" AS "characterId",
        COALESCE("Character"."classId", "ResolvedClass"."id") AS "resolvedClassId",
        "CharacterStats"."hitDice" AS "hitDice",
        "Character"."level" AS "level",
        COALESCE("ResolvedClass"."hitDie", "DirectClass"."hitDie") AS "hitDie"
    FROM "CharacterStats"
    INNER JOIN "Character"
        ON "Character"."id" = "CharacterStats"."characterId"
    LEFT JOIN "Class" AS "DirectClass"
        ON "DirectClass"."id" = "Character"."classId"
    LEFT JOIN "Class" AS "ResolvedClass"
        ON "ResolvedClass"."name" = "Character"."class"
)
INSERT INTO "HitDicePool" (
    "id",
    "characterId",
    "classId",
    "total",
    "remaining",
    "die"
)
SELECT
    'hd_' || "ResolvedCharacterRows"."characterId",
    "ResolvedCharacterRows"."characterId",
    "ResolvedCharacterRows"."resolvedClassId",
    COALESCE(("ResolvedCharacterRows"."hitDice"->>'total')::INTEGER, "ResolvedCharacterRows"."level"),
    COALESCE(("ResolvedCharacterRows"."hitDice"->>'remaining')::INTEGER, "ResolvedCharacterRows"."level"),
    COALESCE(
        "ResolvedCharacterRows"."hitDice"->>'die',
        CASE
            WHEN "ResolvedCharacterRows"."hitDie" IS NOT NULL THEN 'd' || "ResolvedCharacterRows"."hitDie"::TEXT
            ELSE 'd8'
        END
    )
FROM "ResolvedCharacterRows"
WHERE "ResolvedCharacterRows"."resolvedClassId" IS NOT NULL;

-- Drop obsolete uniqueness before replacing it with the multiclass-safe key.
DROP INDEX "SpellSlot_characterId_level_key";

-- Drop obsolete single-class relations and columns after backfill.
ALTER TABLE "Character" DROP CONSTRAINT "Character_classId_fkey";
ALTER TABLE "Character" DROP CONSTRAINT "Character_subclassId_fkey";

DROP INDEX "Character_classId_idx";
DROP INDEX "Character_subclassId_idx";

ALTER TABLE "CharacterStats" DROP COLUMN "hitDice";

ALTER TABLE "Character"
DROP COLUMN "class",
DROP COLUMN "subclass",
DROP COLUMN "level",
DROP COLUMN "classId",
DROP COLUMN "subclassId";

-- CreateIndex
CREATE INDEX "CharacterClass_characterId_idx" ON "CharacterClass"("characterId");

-- CreateIndex
CREATE INDEX "CharacterClass_classId_idx" ON "CharacterClass"("classId");

-- CreateIndex
CREATE INDEX "CharacterClass_subclassId_idx" ON "CharacterClass"("subclassId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_characterId_classId_key" ON "CharacterClass"("characterId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_characterId_order_key" ON "CharacterClass"("characterId", "order");

-- CreateIndex
CREATE INDEX "HitDicePool_characterId_idx" ON "HitDicePool"("characterId");

-- CreateIndex
CREATE INDEX "HitDicePool_classId_idx" ON "HitDicePool"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "HitDicePool_characterId_classId_key" ON "HitDicePool"("characterId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "SpellSlot_characterId_kind_level_key" ON "SpellSlot"("characterId", "kind", "level");

-- AddForeignKey
ALTER TABLE "CharacterClass"
ADD CONSTRAINT "CharacterClass_characterId_fkey"
FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass"
ADD CONSTRAINT "CharacterClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass"
ADD CONSTRAINT "CharacterClass_subclassId_fkey"
FOREIGN KEY ("subclassId") REFERENCES "Subclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitDicePool"
ADD CONSTRAINT "HitDicePool_characterId_fkey"
FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitDicePool"
ADD CONSTRAINT "HitDicePool_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
