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
    items: T[];
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
    meta: (item: T) => ReactNode;
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
