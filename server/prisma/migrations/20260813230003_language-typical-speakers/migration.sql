-- AlterTable
ALTER TABLE "Language" ADD COLUMN "typicalSpeakers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
