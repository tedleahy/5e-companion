ALTER TABLE "Subclass" ADD COLUMN "selectionLevel" INTEGER;

UPDATE "Subclass" AS subclass
SET "selectionLevel" = CASE class."srdIndex"
    WHEN 'cleric' THEN 1
    WHEN 'sorcerer' THEN 1
    WHEN 'warlock' THEN 1
    WHEN 'druid' THEN 2
    WHEN 'wizard' THEN 2
    ELSE 3
END
FROM "Class" AS class
WHERE subclass."classId" = class."id";

ALTER TABLE "Subclass" ALTER COLUMN "selectionLevel" SET NOT NULL;

ALTER TABLE "Subclass"
ADD CONSTRAINT "Subclass_selectionLevel_check"
CHECK ("selectionLevel" BETWEEN 1 AND 20);
