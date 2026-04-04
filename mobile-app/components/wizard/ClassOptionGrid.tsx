import OptionGrid from '@/components/wizard/OptionGrid';
import { CLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';

type ClassOptionGridProps = {
    selected: string;
    onSelect: (classId: string) => void;
    options?: OptionItem[];
    tone?: 'night' | 'parchment';
    getOptionTestId?: (option: OptionItem) => string | undefined;
    getOptionAccessibilityLabel?: (option: OptionItem) => string | undefined;
};

/**
 * Shared SRD class grid used by both character creation and level-up flows.
 */
export default function ClassOptionGrid({
    selected,
    onSelect,
    options = CLASS_OPTIONS,
    tone = 'night',
    getOptionTestId,
    getOptionAccessibilityLabel,
}: ClassOptionGridProps) {
    return (
        <OptionGrid
            options={options}
            selected={selected}
            onSelect={onSelect}
            tone={tone}
            getOptionTestId={getOptionTestId}
            getOptionAccessibilityLabel={getOptionAccessibilityLabel}
        />
    );
}
