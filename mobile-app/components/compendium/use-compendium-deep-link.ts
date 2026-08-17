import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

type DeepLinkItem = {
    value: string;
};

type UseCompendiumDeepLinkOptions<T extends DeepLinkItem> = {
    items: T[];
    loading: boolean;
    errorMessage?: string;
    onSelect: (value: string) => void;
};

function firstParamValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

/** Opens a matching `?value=` once, while leaving detail Back under local control. */
export default function useCompendiumDeepLink<T extends DeepLinkItem>({
    items,
    loading,
    errorMessage,
    onSelect,
}: UseCompendiumDeepLinkOptions<T>) {
    const params = useLocalSearchParams<{ value?: string | string[] }>();
    const requestedValue = firstParamValue(params.value);
    const appliedRequestedValue = useRef<string | undefined>(undefined);
    const [focused, setFocused] = useState(true);

    useFocusEffect(useCallback(() => {
        setFocused(true);
        return () => setFocused(false);
    }, []));

    useEffect(() => {
        // Lateral jumps between categories pop back to a screen that is already
        // mounted rather than remounting it. Forgetting the applied value while
        // off-screen means returning with the same `?value=` reopens the detail,
        // while Back within a single visit still leaves the list showing.
        if (!focused) {
            appliedRequestedValue.current = undefined;
            return;
        }
        if (requestedValue == null) {
            appliedRequestedValue.current = undefined;
            return;
        }
        if (
            loading
            || (errorMessage != null && items.length === 0)
            || appliedRequestedValue.current === requestedValue
        ) return;

        appliedRequestedValue.current = requestedValue;
        if (items.some((item) => item.value === requestedValue)) {
            onSelect(requestedValue);
        }
    }, [errorMessage, focused, items, loading, onSelect, requestedValue]);
}
