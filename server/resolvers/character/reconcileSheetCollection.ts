/**
 * Minimal persisted row shape for character-scoped collection reconciliation.
 */
type CharacterScopedRow = {
    id: string;
};

/**
 * Delegate methods required to reconcile one character-scoped collection.
 */
type CharacterScopedCollectionDelegate<
    TExisting extends CharacterScopedRow,
    TUpdateData,
    TCreateData,
> = {
    findMany(args: { where: { characterId: string } }): Promise<TExisting[]>;
    deleteMany(args: {
        where: {
            characterId: string;
            id: { in: string[] };
        };
    }): Promise<unknown>;
    update(args: {
        where: { id: string };
        data: TUpdateData;
    }): Promise<unknown>;
    create(args: {
        data: TCreateData;
    }): Promise<unknown>;
};

/**
 * Input accepted by the generic character-sheet collection reconciler.
 */
type ReconcileCharacterSheetCollectionArgs<
    TExisting extends CharacterScopedRow,
    TInput extends { id?: string | null },
    TUpdateData,
    TCreateData,
> = {
    delegate: CharacterScopedCollectionDelegate<TExisting, TUpdateData, TCreateData>;
    characterId: string;
    nextItems: TInput[];
    notFoundMessage: string;
    buildUpdateData(item: TInput): TUpdateData;
    buildCreateData(item: TInput, characterId: string): TCreateData;
};

/**
 * Reconciles one character-owned collection against the submitted sheet payload.
 */
export async function reconcileCharacterSheetCollection<
    TExisting extends CharacterScopedRow,
    TInput extends { id?: string | null },
    TUpdateData,
    TCreateData,
>({
    delegate,
    characterId,
    nextItems,
    notFoundMessage,
    buildUpdateData,
    buildCreateData,
}: ReconcileCharacterSheetCollectionArgs<TExisting, TInput, TUpdateData, TCreateData>) {
    const existingItems = await delegate.findMany({
        where: { characterId },
    });
    const existingIds = new Set(existingItems.map((item) => item.id));
    const submittedIds = new Set(
        nextItems
            .map((item) => item.id)
            .filter((itemId): itemId is string => typeof itemId === 'string'),
    );

    const removedIds = existingItems
        .filter((item) => !submittedIds.has(item.id))
        .map((item) => item.id);

    if (removedIds.length > 0) {
        await delegate.deleteMany({
            where: {
                characterId,
                id: { in: removedIds },
            },
        });
    }

    for (const item of nextItems) {
        if (item.id) {
            if (!existingIds.has(item.id)) {
                throw new Error(notFoundMessage);
            }

            await delegate.update({
                where: { id: item.id },
                data: buildUpdateData(item),
            });
            continue;
        }

        await delegate.create({
            data: buildCreateData(item, characterId),
        });
    }
}
