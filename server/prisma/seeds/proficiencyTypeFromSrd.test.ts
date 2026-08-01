import { describe, expect, test } from 'bun:test';
import { ProficiencyType } from '@prisma/client';
import { proficiencyNameFromSrd, proficiencyTypeFromSrd } from './seedCharacterReferenceData';

describe('proficiencyTypeFromSrd', () => {
    test('maps core SRD category labels onto ProficiencyType', () => {
        expect(proficiencyTypeFromSrd('Armor')).toBe(ProficiencyType.ARMOR);
        expect(proficiencyTypeFromSrd('Weapons')).toBe(ProficiencyType.WEAPON);
        expect(proficiencyTypeFromSrd('Skills')).toBe(ProficiencyType.SKILL);
        expect(proficiencyTypeFromSrd('Saving Throws')).toBe(ProficiencyType.SAVING_THROW);
        expect(proficiencyTypeFromSrd('Other')).toBe(ProficiencyType.OTHER);
    });

    test('maps tool subcategories onto TOOL', () => {
        expect(proficiencyTypeFromSrd("Artisan's Tools")).toBe(ProficiencyType.TOOL);
        expect(proficiencyTypeFromSrd('Gaming Sets')).toBe(ProficiencyType.TOOL);
        expect(proficiencyTypeFromSrd('Musical Instruments')).toBe(ProficiencyType.TOOL);
        expect(proficiencyTypeFromSrd('Vehicles')).toBe(ProficiencyType.TOOL);
        expect(proficiencyTypeFromSrd('Tools')).toBe(ProficiencyType.TOOL);
    });
});

describe('proficiencyNameFromSrd', () => {
    test('strips the Skill: prefix from SRD skill proficiency names', () => {
        expect(proficiencyNameFromSrd('Skill: Acrobatics')).toBe('Acrobatics');
        expect(proficiencyNameFromSrd('Skill: Animal Handling')).toBe('Animal Handling');
    });

    test('leaves non-skill proficiency names unchanged', () => {
        expect(proficiencyNameFromSrd('Light Armor')).toBe('Light Armor');
        expect(proficiencyNameFromSrd('Saving Throw: STR')).toBe('Saving Throw: STR');
        expect(proficiencyNameFromSrd('Acrobatics')).toBe('Acrobatics');
    });
});
