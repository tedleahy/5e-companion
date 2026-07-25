import { ABILITY_KEYS, abilityModifier, SKILL_DEFINITIONS, type AbilityKey } from '@/lib/characterSheetUtils';
import { applyRacialBonuses, RACE_SPEED_MAP } from '@/lib/characterCreation/raceRules';
import {
    sanitiseCharacterClassRow,
    sortClassRowsForDisplay,
} from '@/lib/characterCreation/multiclass';
import { SUBCLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';
import type { CharacterDraft } from '@/store/characterDraft';
import { ProficiencyLevel, type CreateCharacterInput } from '@/types/generated_graphql_types';

/**
 * Compatibility skill map. Creation derives persisted skills server-side from
 * validated `proficiencyChoices` plus fixed grants; this is not provenance.
 */
function buildCompatibilitySkillProficiencies(): CreateCharacterInput['skillProficiencies'] {
    const skillProficiencies: Record<string, ProficiencyLevel> = {};
    for (const skill of SKILL_DEFINITIONS) {
        skillProficiencies[skill.key] = ProficiencyLevel.None;
    }
    return skillProficiencies as CreateCharacterInput['skillProficiencies'];
}

/**
 * Applies ASI allocations, then racial bonuses, to the draft ability scores.
 */
function calculateFinalAbilityScores(draft: CharacterDraft): Record<AbilityKey, number> {
    const abilityScoresWithAsi = ABILITY_KEYS.reduce((scores, key) => {
        scores[key] = draft.abilityScores[key] + (draft.asiAllocations[key] ?? 0);
        return scores;
    }, {} as Record<AbilityKey, number>);

    return applyRacialBonuses(abilityScoresWithAsi, draft.race);
}

/**
 * Converts the local draft state into the API input used to create a character.
 */
export function buildCreateCharacterInput(
    draft: CharacterDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): CreateCharacterInput {
    const finalScores = calculateFinalAbilityScores(draft);
    const dexterityModifier = abilityModifier(finalScores.dexterity);
    const hasTraits = draft.personalityTraits || draft.ideals || draft.bonds || draft.flaws;
    const classRows = sortClassRowsForDisplay(
        draft.classes.map((classRow) => sanitiseCharacterClassRow(classRow, subclassOptionsByClassId)),
        draft.startingClassId,
    );

    return {
        name: draft.name.trim(),
        race: draft.race,
        classes: classRows.map((classRow) => ({
            classId: classRow.classId,
            ...(classRow.subclassId ? { subclassId: classRow.subclassId } : {}),
            level: classRow.level,
        })),
        featureChoices: draft.featureChoices,
        startingClassId: draft.startingClassId,
        alignment: draft.alignment ?? '',
        background: draft.background,
        ac: 10 + dexterityModifier,
        initiative: dexterityModifier,
        speed: RACE_SPEED_MAP[draft.race] ?? 30,
        abilityScores: finalScores,
        skillProficiencies: buildCompatibilitySkillProficiencies(),
        ...(draft.proficiencyChoices.length > 0
            ? { proficiencyChoices: draft.proficiencyChoices }
            : {}),
        ...(hasTraits
            ? {
                  traits: {
                      personality: draft.personalityTraits,
                      ideals: draft.ideals,
                      bonds: draft.bonds,
                      flaws: draft.flaws,
                  },
              }
            : {}),
    };
}
