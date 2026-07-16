-- Move addSpellcastingAbility from per-level progression to the class row.
ALTER TABLE "Class" ADD COLUMN "addSpellcastingAbility" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Class" AS c
SET "addSpellcastingAbility" = true
WHERE EXISTS (
    SELECT 1
    FROM "ClassLevelProgression" AS p
    WHERE p."classId" = c."id"
      AND p."addSpellcastingAbility" = true
);

ALTER TABLE "ClassLevelProgression" DROP COLUMN "addSpellcastingAbility";
