export type SrdClassLevel = {
    level: number;
    class: {
        index: string;
        name: string;
    };
    subclass?: {
        index: string;
        name: string;
    };
};

/** Returns the canonical 1–20 base-class progression, excluding subclass level rows. */
export function baseClassProgressionLevels<T extends SrdClassLevel>(levels: T[], classIndex: string): T[] {
    const classLevels = levels
        .filter((level) => level.class.index === classIndex && level.subclass == null)
        .sort((left, right) => left.level - right.level);
    const expectedLevels = Array.from({ length: 20 }, (_, index) => index + 1);

    if (classLevels.length !== 20 || classLevels.some((level, index) => level.level !== expectedLevels[index])) {
        throw new Error(`Expected one base progression row for each ${classIndex} level from 1 through 20.`);
    }

    return classLevels;
}
