/**
 * Minimal persisted row shape for owned collection reconciliation.
 */
type OwnedCollectionRow = {
    id: string;
};

/**
 * Delegate methods required to reconcile one owned collection.
 */
type OwnedCollectionDelegate<
    TExisting extends OwnedCollectionRow,
    TScopeWhere,
    TDeleteWhere,
    TUpdateWhere,
    TUpdateData,
    TCreateData,
> = {
    findMany(args: { where: TScopeWhere }): Promise<TExisting[]>;
    deleteMany(args: { where: TDeleteWhere }): Promise<unknown>;
    update(args: {
        where: TUpdateWhere;
        data: TUpdateData;
    }): Promise<unknown>;
    create(args: {
        data: TCreateData;
    }): Promise<unknown>;
};

/**
 * Input accepted by the generic owned collection reconciler.
 */
type ReconcileOwnedCollectionArgs<
    TExisting extends OwnedCollectionRow,
    TInput extends { id?: string | null },
    TScopeWhere,
    TDeleteWhere,
    TUpdateWhere,
    TUpdateData,
    TCreateData,
> = {
    delegate: OwnedCollectionDelegate<
        TExisting,
        TScopeWhere,
        TDeleteWhere,
        TUpdateWhere,
        TUpdateData,
        TCreateData
    >;
    scopeWhere: TScopeWhere;
    nextItems: TInput[];
    notFoundMessage: string;
    buildDeleteWhere(removedIds: string[], scopeWhere: TScopeWhere): TDeleteWhere;
    buildUpdateWhere(itemId: string, scopeWhere: TScopeWhere): TUpdateWhere;
    buildUpdateData(item: TInput): Promise<TUpdateData> | TUpdateData;
    buildCreateData(item: TInput, scopeWhere: TScopeWhere): Promise<TCreateData> | TCreateData;
    updateManyItems?(
        items: Array<{ id: string; data: TUpdateData }>,
        scopeWhere: TScopeWhere,
    ): Promise<unknown>;
    createManyItems?(items: TCreateData[], scopeWhere: TScopeWhere): Promise<unknown>;
};

/**
 * Reconciles a submitted collection within an ownership scope.
 */
export async function reconcileOwnedCollection<
    TExisting extends OwnedCollectionRow,
    TInput extends { id?: string | null },
    TScopeWhere,
    TDeleteWhere,
    TUpdateWhere,
    TUpdateData,
    TCreateData,
>({
    delegate,
    scopeWhere,
    nextItems,
    notFoundMessage,
    buildDeleteWhere,
    buildUpdateWhere,
    buildUpdateData,
    buildCreateData,
    updateManyItems,
    createManyItems,
}: ReconcileOwnedCollectionArgs<
    TExisting,
    TInput,
    TScopeWhere,
    TDeleteWhere,
    TUpdateWhere,
    TUpdateData,
    TCreateData
>) {
    const existingItems = await delegate.findMany({
        where: scopeWhere,
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

    const itemsToUpdate = nextItems.filter(
        (item): item is TInput & { id: string } => typeof item.id === 'string',
    );

    for (const item of itemsToUpdate) {
        if (!existingIds.has(item.id)) {
            throw new Error(notFoundMessage);
        }
    }

    if (removedIds.length > 0) {
        await delegate.deleteMany({
            where: buildDeleteWhere(removedIds, scopeWhere),
        });
    }

    const updateEntries = await Promise.all(itemsToUpdate.map(async (item) => ({
        id: item.id,
        data: await buildUpdateData(item),
    })));
    const createEntries = await Promise.all(
        nextItems
            .filter((item) => !item.id)
            .map((item) => buildCreateData(item, scopeWhere)),
    );

    if (updateEntries.length > 0 && updateManyItems) {
        await updateManyItems(updateEntries, scopeWhere);
    } else {
        for (const { id, data } of updateEntries) {
            await delegate.update({
                where: buildUpdateWhere(id, scopeWhere),
                data,
            });
        }
    }

    if (createEntries.length > 0 && createManyItems) {
        await createManyItems(createEntries, scopeWhere);
    } else {
        for (const data of createEntries) {
            await delegate.create({ data });
        }
    }
}

/**
 * Reconciles one character-owned collection against the submitted sheet payload.
 */
export async function reconcileCharacterSheetCollection<
    TExisting extends OwnedCollectionRow,
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
}: {
    delegate: OwnedCollectionDelegate<
        TExisting,
        { characterId: string },
        { characterId: string; id: { in: string[] } },
        { id: string },
        TUpdateData,
        TCreateData
    >;
    characterId: string;
    nextItems: TInput[];
    notFoundMessage: string;
    buildUpdateData(item: TInput): Promise<TUpdateData> | TUpdateData;
    buildCreateData(item: TInput, characterId: string): Promise<TCreateData> | TCreateData;
}) {
    await reconcileOwnedCollection({
        delegate,
        scopeWhere: { characterId },
        nextItems,
        notFoundMessage,
        buildDeleteWhere: (removedIds, scopeWhere) => ({
            ...scopeWhere,
            id: { in: removedIds },
        }),
        buildUpdateWhere: (itemId) => ({ id: itemId }),
        buildUpdateData,
        buildCreateData: (item, scopeWhere) => buildCreateData(item, scopeWhere.characterId),
    });
}
