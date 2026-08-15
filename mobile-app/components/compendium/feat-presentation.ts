import type { CompendiumFeatsQuery } from '@/types/generated_graphql_types';

export type Feat = CompendiumFeatsQuery['compendiumFeats'][number];

export function featDescriptionParts(description: string[]) {
    const lines = description.flatMap((paragraph) => paragraph.split('\n'))
        .map((line) => line.trim())
        .filter(Boolean);
    const lead = lines.find((line) => !line.startsWith('- ')) ?? '';

    return {
        lead,
        supporting: lines.filter((line) => line !== lead && !line.startsWith('- ')),
        benefits: lines.filter((line) => line.startsWith('- ')).map((line) => line.slice(2).trim()),
    };
}
