import prisma from "../../prisma/prisma";
import type { AvailableBackground } from "../../generated/graphql";

/**
 * Loads backgrounds visible to the current user (SRD plus owned custom entries).
 */
export async function availableBackgroundsForUser(
    userId: string,
): Promise<AvailableBackground[]> {
    const backgrounds = await prisma.background.findMany({
        where: {
            OR: [
                { ownerUserId: null },
                { ownerUserId: userId },
            ],
        },
        orderBy: { name: "asc" },
    });

    return backgrounds.map((bg) => ({
        id: bg.id,
        value: bg.srdIndex ?? bg.id,
        srdIndex: bg.srdIndex,
        name: bg.name,
        description: bg.featureDescription.join("\n\n").trim(),
        featureName: bg.featureName,
        isCustom: bg.ownerUserId != null,
    }));
}
