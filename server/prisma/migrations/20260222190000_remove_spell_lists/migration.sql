-- Drop user-owned spell list tables; spell ownership now lives on character spellbooks.
DROP TABLE IF EXISTS "SpellListSpell";
DROP TABLE IF EXISTS "SpellList";
