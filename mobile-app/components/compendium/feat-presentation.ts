import type { CompendiumFeatsQuery } from '@/types/generated_graphql_types';

export type Feat = CompendiumFeatsQuery['compendiumFeats'][number];

function isBenefit(line: string) {
    return line.startsWith('- ');
}

/**
 * Splits a feat description into a lead paragraph, the remaining prose, and
 * display-only benefit bullets. The lead is removed by position, not by value,
 * so a description that repeats a paragraph keeps the later copy.
 */
export function featDescriptionParts(description: string[]) {
    const lines = description.flatMap((paragraph) => paragraph.split('\n'))
        .map((line) => line.trim())
        .filter(Boolean);
    const leadIndex = lines.findIndex((line) => !isBenefit(line));

    return {
        lead: leadIndex === -1 ? '' : lines[leadIndex]!,
        supporting: lines.filter((line, index) => index !== leadIndex && !isBenefit(line)),
        benefits: lines.filter(isBenefit).map((line) => line.slice(2).trim()),
    };
}
