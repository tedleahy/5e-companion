import type { ReactNode } from 'react';

export type CompendiumCollectionItem = {
    value: string;
    name: string;
    isCustom: boolean;
};

export type CompendiumCollectionFilters = {
    search: {
        placeholder: string;
        value: string;
        onChange: (value: string) => void;
    };
    includeSrd: {
        value: boolean;
        onChange: (value: boolean) => void;
    };
    category?: {
        content: ReactNode;
        active: boolean;
        onClear: () => void;
    };
};

export type CompendiumCollectionData<T extends CompendiumCollectionItem> = {
    /** Rows to list, after search and filters. */
    items: T[];
    /**
     * Every visible row before filtering. The open detail resolves against this
     * so narrowing the filters (or jumping to a filtered-out peer) does not
     * close it.
     */
    allItems: T[];
    selectedValue: string | null;
    onSelectedValueChange: (value: string | null) => void;
    loading?: boolean;
    error?: {
        message: string;
        onRetry?: () => void;
    };
};

export type CompendiumCollectionRowRenderers<T extends CompendiumCollectionItem> = {
    mark: (item: T) => ReactNode;
    /** Rendered inside a `Text`, so it must be a string. */
    meta: (item: T) => string;
    extra?: (item: T) => ReactNode;
};

export type CompendiumCollectionProps<T extends CompendiumCollectionItem> = {
    heading: {
        title: string;
        noun: string;
    };
    filters: CompendiumCollectionFilters;
    collection: CompendiumCollectionData<T>;
    empty: {
        title: string;
        body: string;
    };
    row: CompendiumCollectionRowRenderers<T>;
    renderDetail: (item: T) => ReactNode;
};
