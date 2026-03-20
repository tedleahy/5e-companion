-- Rename the character gear table to match the canonical "weapon" term.
ALTER TABLE "Attack" RENAME TO "Weapon";

-- Keep the supporting index and constraint names aligned with the new table name.
ALTER INDEX "Attack_pkey" RENAME TO "Weapon_pkey";
ALTER INDEX "Attack_characterId_idx" RENAME TO "Weapon_characterId_idx";
ALTER TABLE "Weapon" RENAME CONSTRAINT "Attack_characterId_fkey" TO "Weapon_characterId_fkey";
