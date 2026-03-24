/*
  Warnings:

  - You are about to drop the column `order` on the `CharacterClass` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CharacterClass_characterId_order_key";

-- AlterTable
ALTER TABLE "CharacterClass" DROP COLUMN "order";
