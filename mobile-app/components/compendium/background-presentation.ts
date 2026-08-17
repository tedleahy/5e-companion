import type { CompendiumBackgroundsQuery } from '@/types/generated_graphql_types';

export type Background = CompendiumBackgroundsQuery['compendiumBackgrounds'][number];

type EquipmentEntry = Background['startingEquipment'][number];

/** One rendered starting-equipment line: a fixed grant, or a choose-N group. */
export type EquipmentLine = {
    text: string;
    /** Present only for choice groups; the number of options the player picks. */
    choose?: number;
};

export function proficienciesOfType(background: Background, type: string) {
    return background.proficiencies
        .filter((proficiency) => proficiency.type.toLocaleUpperCase() === type)
        .map((proficiency) => proficiency.name);
}

function equipmentText(item: EquipmentEntry) {
    return `${item.quantity}× ${item.name}`;
}

/**
 * Fixed grants first, then one line per choice group. The "choose N" wording is
 * carried by `choose` rather than baked into `text`, so the renderer owns the
 * prefix and cannot double it up.
 */
export function equipmentLines(background: Background): EquipmentLine[] {
    const fixed: EquipmentLine[] = [];
    const groups = new Map<number, EquipmentEntry[]>();

    for (const item of background.startingEquipment) {
        if (item.choiceGroup == null) {
            fixed.push({ text: equipmentText(item) });
            continue;
        }
        const group = groups.get(item.choiceGroup);
        if (group) group.push(item);
        else groups.set(item.choiceGroup, [item]);
    }

    return [
        ...fixed,
        ...[...groups.values()].map((items) => ({
            choose: items[0]?.choiceCount ?? 1,
            text: items.map(equipmentText).join(' or '),
        })),
    ];
}

/** Diamond for a fixed grant, or a single "Choose" prefix for a choice group. */
export function equipmentMarker(choose: number | undefined) {
    if (choose == null) return '◆';
    return choose > 1 ? `Choose ${choose}:` : 'Choose:';
}
