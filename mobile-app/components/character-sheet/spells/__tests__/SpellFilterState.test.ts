import {
    buildAddSpellFilterInput,
    countActiveFilters,
    defaultFilterForClass,
} from '../SpellFilterState';

describe('SpellFilterState', () => {
    it('includes selected schools in the GraphQL filter input', () => {
        expect(buildAddSpellFilterInput({
            ...defaultFilterForClass('Wizard'),
            schools: ['abjuration', 'evocation'],
        }, 'Shield')).toEqual({
            name: 'Shield',
            classes: ['wizard'],
            schools: ['abjuration', 'evocation'],
        });
    });

    it('counts school filters alongside the shared spell filters', () => {
        expect(countActiveFilters({
            ...defaultFilterForClass('Wizard'),
            ritual: true,
            schools: ['abjuration', 'evocation'],
        })).toBe(4);
    });
});
