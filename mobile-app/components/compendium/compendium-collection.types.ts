import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';

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

/**
 * Trailing control on a collection row, such as edit or delete for custom
 * content. Declared rather than rendered by the screen so placement, hit
 * targets, and labelling stay consistent across categories.
 */
export type CompendiumRowAction = {
    icon: ComponentProps<typeof Ionicons>['name'];
    /** Spoken label; name the record, e.g. `Edit Path of Embers`. */
    accessibilityLabel: string;
    onPress: () => void;
    /** Tints the control to warn before the confirmation step. */
    destructive?: boolean;
    testID?: string;
};

export type CompendiumCollectionRowRenderers<T extends CompendiumCollectionItem> = {
    mark: (item: T) => ReactNode;
    /** Rendered inside a `Text`, so it must be a string. */
    meta: (item: T) => string;
    extra?: (item: T) => ReactNode;
    /**
     * Trailing edit/delete controls. Return an empty array for rows that cannot
     * be edited, which is how SRD rows stay read-only beside custom ones.
     */
    actions?: (item: T) => CompendiumRowAction[];
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
    /**
     * Floating create action. The shell hides it whenever a detail is open, so
     * screens do not have to track detail visibility themselves.
     */
    floatingAction?: {
        accessibilityLabel: string;
        onPress: () => void;
        testID?: string;
    };
    /** Sheets, dialogs, and snackbars, rendered above the card. */
    overlay?: ReactNode;
};
