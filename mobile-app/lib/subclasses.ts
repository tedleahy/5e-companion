import type {
    AvailableSubclassesQuery,
} from '@/types/generated_graphql_types';
import { SUBCLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';

/**
 * One reusable feature definition attached to a visible subclass.
 */
export type AvailableSubclassFeature = {
    id: string;
    name: string;
    description: string;
    level: number;
};

/**
 * One subclass option visible to the signed-in user.
 */
export type AvailableSubclassOption = {
    id: string;
    value: string;
    srdIndex: string | null;
    classId: string;
    className: string;
    name: string;
    description: string;
    isCustom: boolean;
    features: AvailableSubclassFeature[];
    icon: string;
    hint?: string;
};

type AvailableSubclassQueryRow = AvailableSubclassesQuery['availableSubclasses'][number];

/**
 * Maps GraphQL subclass rows into the mobile display shape.
 */
export function mapAvailableSubclassOption(
    subclass: AvailableSubclassQueryRow,
): AvailableSubclassOption {
    const staticOption = subclass.srdIndex
        ? (SUBCLASS_OPTIONS[subclass.classId] ?? []).find((option) => option.value === subclass.srdIndex) ?? null
        : null;

    return {
        id: subclass.id,
        value: subclass.value,
        srdIndex: subclass.srdIndex ?? null,
        classId: subclass.classId,
        className: subclass.className,
        name: subclass.name,
        description: subclass.description.join('\n\n').trim(),
        isCustom: subclass.isCustom,
        features: subclass.features.map((feature) => ({
            id: feature.id,
            name: feature.name,
            description: feature.description,
            level: feature.level,
        })),
        icon: staticOption?.icon ?? (subclass.isCustom ? '\u2728' : '\u2736'),
        hint: staticOption?.hint,
    };
}

/**
 * Groups subclass options by SRD class id for the create wizard.
 */
export function groupAvailableSubclassesByClassId(
    subclasses: readonly AvailableSubclassOption[],
): Record<string, AvailableSubclassOption[]> {
    return subclasses.reduce<Record<string, AvailableSubclassOption[]>>((groups, subclass) => {
        if (!groups[subclass.classId]) {
            groups[subclass.classId] = [];
        }

        groups[subclass.classId]!.push(subclass);
        return groups;
    }, {});
}

/**
 * Converts visible subclass rows into the existing OptionGrid shape.
 */
export function subclassOptionItems(
    subclasses: readonly AvailableSubclassOption[],
): OptionItem[] {
    return subclasses.map((subclass) => ({
        value: subclass.value,
        label: subclass.name,
        icon: subclass.icon,
        hint: subclass.hint ?? (subclass.isCustom ? 'Your custom subclass' : undefined),
    }));
}
