import type { CompendiumBackgroundsQuery } from '@/types/generated_graphql_types';

export type Background = CompendiumBackgroundsQuery['compendiumBackgrounds'][number];

export function proficienciesOfType(background: Background, type: string) {
    return background.proficiencies
        .filter((proficiency) => proficiency.type.toLocaleUpperCase() === type)
        .map((proficiency) => proficiency.name);
}

export function equipmentLines(background: Background) {
    const fixed = background.startingEquipment
        .filter((item) => item.choiceGroup == null)
        .map((item) => `${item.quantity}× ${item.name}`);
    const groups = new Map<number, typeof background.startingEquipment>();

    background.startingEquipment.forEach((item) => {
        if (item.choiceGroup == null) return;
        groups.set(item.choiceGroup, [...(groups.get(item.choiceGroup) ?? []), item]);
    });

    return [
        ...fixed.map((line) => ({ choice: false, text: line })),
        ...[...groups.values()].map((items) => ({
            choice: true,
            text: `Choose ${items[0]?.choiceCount ?? 1}: ${items.map((item) => `${item.quantity}× ${item.name}`).join(' or ')}`,
        })),
    ];
}
