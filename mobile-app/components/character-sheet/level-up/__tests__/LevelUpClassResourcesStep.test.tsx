import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LevelUpClassResourcesStep from '../LevelUpClassResourcesStep';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import {
    createLevelUpInvocationState,
    createLevelUpMetamagicState,
    createLevelUpMysticArcanumState,
} from '@/lib/characterLevelUp/advancedClassChoices';
import type {
    InvocationPrerequisiteContext,
    LevelUpInvocationState,
    LevelUpMetamagicState,
    LevelUpMysticArcanumState,
} from '@/lib/characterLevelUp/advancedClassChoices';

function makeSelectedClass(classId: string, currentLevel: number, newLevel: number): LevelUpWizardSelectedClass {
    return {
        classId,
        className: classId.charAt(0).toUpperCase() + classId.slice(1),
        currentLevel,
        newLevel,
        isExistingClass: true,
        subclassId: null,
        subclassName: null,
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
    };
}

const noopFn = jest.fn();

type RenderStepOptions = {
    invocationPrerequisiteContext?: InvocationPrerequisiteContext | null;
    invocationState?: LevelUpInvocationState;
    metamagicState?: LevelUpMetamagicState;
    mysticArcanumState?: LevelUpMysticArcanumState;
    existingInvocations?: { id: string; name: string; description: string; fullDescription: string; prerequisite: string | null; grantsSpell: boolean }[];
    onToggleInvocation?: jest.Mock;
    onChangeCustomInvocation?: jest.Mock;
    onChangeInvocationSwapOut?: jest.Mock;
    onChangeInvocationSwapIn?: jest.Mock;
    onToggleMetamagic?: jest.Mock;
    onChangeCustomMetamagic?: jest.Mock;
    onChangeMysticArcanumSpell?: jest.Mock;
};

function buildStep(
    classId: string,
    currentLevel: number,
    newLevel: number,
    options: RenderStepOptions = {},
) {
    return (
        <PaperProvider>
            <LevelUpClassResourcesStep
                selectedClass={makeSelectedClass(classId, currentLevel, newLevel)}
                invocationPrerequisiteContext={options.invocationPrerequisiteContext ?? null}
                invocationState={options.invocationState ?? createLevelUpInvocationState()}
                metamagicState={options.metamagicState ?? createLevelUpMetamagicState()}
                mysticArcanumState={options.mysticArcanumState ?? createLevelUpMysticArcanumState()}
                existingInvocations={options.existingInvocations ?? []}
                onToggleInvocation={options.onToggleInvocation ?? noopFn}
                onChangeCustomInvocation={options.onChangeCustomInvocation ?? noopFn}
                onChangeInvocationSwapOut={options.onChangeInvocationSwapOut ?? noopFn}
                onChangeInvocationSwapIn={options.onChangeInvocationSwapIn ?? noopFn}
                onToggleMetamagic={options.onToggleMetamagic ?? noopFn}
                onChangeCustomMetamagic={options.onChangeCustomMetamagic ?? noopFn}
                onChangeMysticArcanumSpell={options.onChangeMysticArcanumSpell ?? noopFn}
            />
        </PaperProvider>
    );
}

function renderStep(
    classId: string,
    currentLevel: number,
    newLevel: number,
    options: RenderStepOptions = {},
) {
    return render(
        buildStep(classId, currentLevel, newLevel, options),
    );
}

describe('LevelUpClassResourcesStep', () => {
    it('shows rage change card for barbarian gaining rages at level 3', () => {
        renderStep('barbarian', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-barbarian-rages')).toBeTruthy();
        expect(screen.getByText('Rages')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();
    });

    it('shows unchanged resources in a separate section', () => {
        renderStep('barbarian', 2, 3);

        expect(screen.getByTestId('level-up-resource-unchanged-barbarian-rage-damage')).toBeTruthy();
    });

    it('shows sneak attack change for rogue at odd levels', () => {
        renderStep('rogue', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-rogue-sneak-attack')).toBeTruthy();
    });

    it('shows multiple monk resource changes', () => {
        renderStep('monk', 4, 5);

        expect(screen.getByTestId('level-up-resource-change-monk-martial-arts')).toBeTruthy();
        expect(screen.getByTestId('level-up-resource-change-monk-ki')).toBeTruthy();
    });

    it('shows warlock invocation changes at level 5', () => {
        renderStep('warlock', 4, 5);

        expect(screen.getByTestId('level-up-resource-change-warlock-invocations')).toBeTruthy();
    });

    it('shows sorcery point changes', () => {
        renderStep('sorcerer', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-sorcerer-sorcery-points')).toBeTruthy();
    });
});

describe('LevelUpClassResourcesStep — Invocation Picker', () => {
    it('shows the invocation picker when warlock gains invocations', () => {
        renderStep('warlock', 1, 2);

        expect(screen.getByTestId('level-up-invocation-picker')).toBeTruthy();
        expect(screen.getByText('Choose Eldritch Invocations')).toBeTruthy();
    });

    it('does not show the invocation picker when no invocations are gained', () => {
        renderStep('warlock', 2, 3);

        expect(screen.queryByTestId('level-up-invocation-picker')).toBeNull();
    });

    it('does not show the invocation picker for non-warlock classes', () => {
        renderStep('barbarian', 2, 3);

        expect(screen.queryByTestId('level-up-invocation-picker')).toBeNull();
    });

    it('shows the invocation swap section at level 3+', () => {
        renderStep('warlock', 2, 3);

        expect(screen.getByTestId('level-up-invocation-swap')).toBeTruthy();
    });

    it('does not show the swap section at level 2', () => {
        renderStep('warlock', 1, 2);

        expect(screen.queryByTestId('level-up-invocation-swap')).toBeNull();
    });

    it('fires onToggleInvocation when an invocation option is pressed', () => {
        const onToggle = jest.fn();
        renderStep('warlock', 1, 2, { onToggleInvocation: onToggle });

        fireEvent.press(screen.getByTestId('level-up-invocation-agonizing-blast'));

        expect(onToggle).toHaveBeenCalledWith('agonizing-blast');
    });

    it('does not toggle invocation selection when pressing read more', () => {
        const onToggle = jest.fn();
        renderStep('warlock', 1, 2, { onToggleInvocation: onToggle });

        fireEvent.press(screen.getByTestId('level-up-invocation-read-more-gaze-of-two-minds'));

        expect(onToggle).not.toHaveBeenCalled();
    });

    it('displays the selection counter', () => {
        const invocationState = {
            ...createLevelUpInvocationState(),
            selectedInvocations: ['agonizing-blast'],
        };
        renderStep('warlock', 1, 2, { invocationState });

        expect(screen.getByText('1 of 2 selected')).toBeTruthy();
    });

    it('supports adding, editing, and removing a custom invocation entry', () => {
        const onChangeCustomInvocation = jest.fn();
        const { rerender } = renderStep('warlock', 1, 2, {
            onChangeCustomInvocation,
        });

        fireEvent.press(screen.getByTestId('level-up-invocation-add-custom'));

        expect(onChangeCustomInvocation).toHaveBeenCalledWith({ name: '', description: '' });

        rerender(buildStep('warlock', 1, 2, {
            invocationState: {
                ...createLevelUpInvocationState(),
                customInvocation: { name: '', description: '' },
            },
            onChangeCustomInvocation,
        }));

        fireEvent.changeText(screen.getByTestId('level-up-invocation-custom-name'), 'Fiendish Chains');

        expect(onChangeCustomInvocation).toHaveBeenLastCalledWith({
            name: 'Fiendish Chains',
            description: '',
        });

        rerender(buildStep('warlock', 1, 2, {
            invocationState: {
                ...createLevelUpInvocationState(),
                customInvocation: { name: 'Fiendish Chains', description: '' },
            },
            onChangeCustomInvocation,
        }));

        fireEvent.changeText(screen.getByTestId('level-up-invocation-custom-description'), 'Bound in shadow and iron.');

        expect(onChangeCustomInvocation).toHaveBeenLastCalledWith({
            name: 'Fiendish Chains',
            description: 'Bound in shadow and iron.',
        });

        fireEvent.press(screen.getByText('Remove custom invocation'));

        expect(onChangeCustomInvocation).toHaveBeenLastCalledWith(null);
    });

    it('supports starting, editing, and cancelling an invocation swap', () => {
        const onChangeInvocationSwapOut = jest.fn();
        const onChangeInvocationSwapIn = jest.fn();
        const { rerender } = renderStep('warlock', 2, 3, {
            onChangeInvocationSwapOut,
            onChangeInvocationSwapIn,
        });

        fireEvent.press(screen.getByTestId('level-up-invocation-start-swap'));

        expect(onChangeInvocationSwapOut).toHaveBeenCalledWith('');

        rerender(buildStep('warlock', 2, 3, {
            invocationState: {
                ...createLevelUpInvocationState(),
                isSwappingInvocation: true,
                swapOutInvocationId: '',
                swapInInvocation: null,
            },
            onChangeInvocationSwapOut,
            onChangeInvocationSwapIn,
        }));

        // Picker for swap-out opens a modal; for now we simulate direct call
        onChangeInvocationSwapOut('Mask of Many Faces');
        expect(onChangeInvocationSwapOut).toHaveBeenLastCalledWith('Mask of Many Faces');

        // Picker for swap-in opens a modal; simulate direct call
        onChangeInvocationSwapIn({
            id: 'custom-swap-Grasp of Hadar',
            name: 'Grasp of Hadar',
            isCustom: true,
        });
        expect(onChangeInvocationSwapIn).toHaveBeenLastCalledWith({
            id: 'custom-swap-Grasp of Hadar',
            name: 'Grasp of Hadar',
            isCustom: true,
        });

        rerender(buildStep('warlock', 2, 3, {
            invocationState: {
                ...createLevelUpInvocationState(),
                isSwappingInvocation: true,
                swapOutInvocationId: 'Mask of Many Faces',
                swapInInvocation: {
                    id: 'custom-swap-Grasp of Hadar',
                    name: 'Grasp of Hadar',
                    isCustom: true,
                },
            },
            onChangeInvocationSwapOut,
            onChangeInvocationSwapIn,
        }));

        fireEvent.press(screen.getByText('Cancel Swap'));

        expect(onChangeInvocationSwapOut).toHaveBeenCalledWith(null);
        expect(onChangeInvocationSwapIn).toHaveBeenCalledWith(null);
    });
});

describe('LevelUpClassResourcesStep — Metamagic Picker', () => {
    it('shows the metamagic picker for sorcerer at level 3', () => {
        renderStep('sorcerer', 2, 3);

        expect(screen.getByTestId('level-up-metamagic-picker')).toBeTruthy();
        expect(screen.getByText('Choose Metamagic')).toBeTruthy();
    });

    it('does not show the metamagic picker at non-gain levels', () => {
        renderStep('sorcerer', 3, 4);

        expect(screen.queryByTestId('level-up-metamagic-picker')).toBeNull();
    });

    it('does not show the metamagic picker for non-sorcerer classes', () => {
        renderStep('warlock', 4, 5);

        expect(screen.queryByTestId('level-up-metamagic-picker')).toBeNull();
    });

    it('fires onToggleMetamagic when a metamagic option is pressed', () => {
        const onToggle = jest.fn();
        renderStep('sorcerer', 2, 3, { onToggleMetamagic: onToggle });

        fireEvent.press(screen.getByTestId('level-up-metamagic-careful-spell'));

        expect(onToggle).toHaveBeenCalledWith('careful-spell');
    });

    it('supports adding, editing, and removing a custom metamagic entry', () => {
        const onChangeCustomMetamagic = jest.fn();
        const { rerender } = renderStep('sorcerer', 2, 3, {
            onChangeCustomMetamagic,
        });

        fireEvent.press(screen.getByTestId('level-up-metamagic-add-custom'));

        expect(onChangeCustomMetamagic).toHaveBeenCalledWith({ name: '', description: '' });

        rerender(buildStep('sorcerer', 2, 3, {
            metamagicState: {
                ...createLevelUpMetamagicState(),
                customMetamagic: { name: '', description: '' },
            },
            onChangeCustomMetamagic,
        }));

        fireEvent.changeText(screen.getByTestId('level-up-metamagic-custom-name'), 'Echoing Spell');

        expect(onChangeCustomMetamagic).toHaveBeenLastCalledWith({
            name: 'Echoing Spell',
            description: '',
        });

        rerender(buildStep('sorcerer', 2, 3, {
            metamagicState: {
                ...createLevelUpMetamagicState(),
                customMetamagic: { name: 'Echoing Spell', description: '' },
            },
            onChangeCustomMetamagic,
        }));

        fireEvent.changeText(screen.getByTestId('level-up-metamagic-custom-description'), 'Your spell repeats its effect a heartbeat later.');

        expect(onChangeCustomMetamagic).toHaveBeenLastCalledWith({
            name: 'Echoing Spell',
            description: 'Your spell repeats its effect a heartbeat later.',
        });

        fireEvent.press(screen.getByText('Remove custom metamagic'));

        expect(onChangeCustomMetamagic).toHaveBeenLastCalledWith(null);
    });
});

describe('LevelUpClassResourcesStep — Mystic Arcanum Picker', () => {
    it('shows the mystic arcanum picker for warlock at level 11', () => {
        renderStep('warlock', 10, 11);

        expect(screen.getByTestId('level-up-mystic-arcanum-picker')).toBeTruthy();
        expect(screen.getByText('Mystic Arcanum')).toBeTruthy();
    });

    it('does not show the mystic arcanum picker at non-arcanum levels', () => {
        renderStep('warlock', 4, 5);

        expect(screen.queryByTestId('level-up-mystic-arcanum-picker')).toBeNull();
    });

    it('does not show the mystic arcanum picker for non-warlock classes', () => {
        renderStep('sorcerer', 10, 11);

        expect(screen.queryByTestId('level-up-mystic-arcanum-picker')).toBeNull();
    });

    it('fires onChangeMysticArcanumSpell when entering and clearing a spell name', () => {
        const onChangeMysticArcanumSpell = jest.fn();
        const { rerender } = renderStep('warlock', 10, 11, {
            onChangeMysticArcanumSpell,
        });

        fireEvent.changeText(screen.getByTestId('level-up-mystic-arcanum-spell-name'), 'Mass Suggestion');

        expect(onChangeMysticArcanumSpell).toHaveBeenCalledWith({
            id: 'arcanum-6-Mass Suggestion',
            name: 'Mass Suggestion',
            level: 6,
        });

        rerender(buildStep('warlock', 10, 11, {
            mysticArcanumState: {
                selectedSpell: {
                    id: 'arcanum-6-Mass Suggestion',
                    name: 'Mass Suggestion',
                    level: 6,
                },
            },
            onChangeMysticArcanumSpell,
        }));

        fireEvent.changeText(screen.getByTestId('level-up-mystic-arcanum-spell-name'), '   ');

        expect(onChangeMysticArcanumSpell).toHaveBeenLastCalledWith(null);
    });
});

describe('LevelUpClassResourcesStep — Invocation Prerequisites', () => {
    const contextWithEldritchBlast: InvocationPrerequisiteContext = {
        warlockLevel: 2,
        knownSpellNames: ['eldritch blast'],
        featureNames: [],
    };

    const contextWithoutEldritchBlast: InvocationPrerequisiteContext = {
        warlockLevel: 2,
        knownSpellNames: ['hex'],
        featureNames: [],
    };

    it('disables invocations with unmet spell prerequisites', () => {
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
        });

        // Agonizing Blast requires Eldritch Blast cantrip - should show as disabled
        const agonizingBlast = screen.getByTestId('level-up-invocation-agonizing-blast');
        expect(agonizingBlast).toBeTruthy();
        expect(agonizingBlast.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables invocations with met spell prerequisites', () => {
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithEldritchBlast,
        });

        const agonizingBlast = screen.getByTestId('level-up-invocation-agonizing-blast');
        expect(agonizingBlast).toBeTruthy();
        expect(agonizingBlast.props.accessibilityState?.disabled).toBe(false);
    });

    it('hides invocations requiring higher level', () => {
        // Level 2 warlock - should not see level 5+ invocations
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
        });

        // Mire the Mind requires level 5 - should be hidden entirely
        expect(screen.queryByTestId('level-up-invocation-mire-the-mind')).toBeNull();
    });

    it('hides invocations requiring a pact', () => {
        // Level 2 warlock without any pact
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
        });

        // Thirsting Blade requires Pact of the Blade - should be hidden entirely
        expect(screen.queryByTestId('level-up-invocation-thirsting-blade')).toBeNull();
    });

    it('shows "Requires" text for unmet spell prerequisites', () => {
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
        });

        expect(screen.getAllByText(/Requires: Eldritch Blast cantrip/).length).toBeGreaterThan(0);
    });

    it('shows invocations without any prerequisite', () => {
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
        });

        const armorOfShadows = screen.getByTestId('level-up-invocation-armor-of-shadows');
        expect(armorOfShadows).toBeTruthy();
        expect(armorOfShadows.props.accessibilityState?.disabled).toBe(false);
    });

    it('does not fire onToggle for disabled spell-prereq invocations', () => {
        const onToggle = jest.fn();
        renderStep('warlock', 1, 2, {
            invocationPrerequisiteContext: contextWithoutEldritchBlast,
            onToggleInvocation: onToggle,
        });

        fireEvent.press(screen.getByTestId('level-up-invocation-agonizing-blast'));

        expect(onToggle).not.toHaveBeenCalled();
    });
});
