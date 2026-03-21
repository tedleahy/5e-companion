import {
    buildSpellFilterInput,
    countActiveSpellFilters,
    EMPTY_SPELL_FILTERS,
} from '../spellFilters';

describe('spellFilters', () => {
    it('includes selected schools in the GraphQL filter input', () => {
        expect(buildSpellFilterInput({
            ...EMPTY_SPELL_FILTERS,
            schools: ['abjuration', 'evocation'],
            classes: ['wizard'],
        }, 'Shield')).toEqual({
            name: 'Shield',
            classes: ['wizard'],
            schools: ['abjuration', 'evocation'],
        });
    });

    it('counts school filters in the active filter badge total', () => {
        expect(countActiveSpellFilters({
            ...EMPTY_SPELL_FILTERS,
            schools: ['abjuration', 'evocation'],
            ritual: true,
        })).toBe(3);
    });
});
