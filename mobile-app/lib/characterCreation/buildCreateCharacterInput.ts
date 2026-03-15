import { ABILITY_KEYS, abilityModifier, deriveSpellcastingStats, SKILL_DEFINITIONS, type AbilityKey } from '@/lib/characterSheetUtils';
import {
    BACKGROUND_SKILL_PROFICIENCIES,
    CLASS_SAVING_THROWS,
    CLASS_SPELLCASTING_ABILITY_MAP,
    HIT_DIE_MAP,
} from '@/lib/characterCreation/classRules';
import { proficiencyBonusForLevel } from '@/lib/characterCreation/abilityRules';
import { applyRacialBonuses, RACE_SPEED_MAP } from '@/lib/characterCreation/raceRules';
import type { CharacterDraft } from '@/store/characterDraft';
import { ProficiencyLevel, type CreateCharacterInput } from '@/types/generated_graphql_types';

/**
 * Builds the GraphQL skill proficiency map from the character draft.
 */
function buildSkillProficiencies(draft: CharacterDraft): CreateCharacterInput['skillProficiencies'] {
    const backgroundSkills = BACKGROUND_SKILL_PROFICIENCIES[draft.background] ?? [];
    const allProficientSkills = new Set([...draft.skillProficiencies, ...backgroundSkills]);
    const expertiseSkills = new Set(draft.expertiseSkills);
    const skillProficiencies: Record<string, ProficiencyLevel> = {};

    for (const skill of SKILL_DEFINITIONS) {
        if (expertiseSkills.has(skill.key)) {
            skillProficiencies[skill.key] = ProficiencyLevel.Expert;
            continue;
        }

        if (allProficientSkills.has(skill.key)) {
            skillProficiencies[skill.key] = ProficiencyLevel.Proficient;
            continue;
        }

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
 * Calculates level-scaled starting HP using average hit die progression.
 */
function calculateStartingHp(level: number, hitDie: number, constitutionModifier: number): number {
    const levelOneHp = Math.max(1, hitDie + constitutionModifier);
    const perLevelHpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier);
    return levelOneHp + Math.max(0, level - 1) * perLevelHpGain;
}

/**
 * Converts the local draft state into the API input used to create a character.
 */
export function buildCreateCharacterInput(draft: CharacterDraft): CreateCharacterInput {
    const finalScores = calculateFinalAbilityScores(draft);
    const hitDie = HIT_DIE_MAP[draft.class] ?? 8;
    const dexterityModifier = abilityModifier(finalScores.dexterity);
    const constitutionModifier = abilityModifier(finalScores.constitution);
    const proficiencyBonus = proficiencyBonusForLevel(draft.level);
    const maxHp = calculateStartingHp(draft.level, hitDie, constitutionModifier);
    const hasTraits = draft.personalityTraits || draft.ideals || draft.bonds || draft.flaws;
    const spellcastingAbility = CLASS_SPELLCASTING_ABILITY_MAP[draft.class];
    const { spellAttackBonus, spellSaveDC } = deriveSpellcastingStats(
        spellcastingAbility,
        finalScores,
        proficiencyBonus,
    );

    return {
        name: draft.name.trim(),
        race: draft.race,
        class: draft.class,
        ...(draft.subclass ? { subclass: draft.subclass } : {}),
        level: draft.level,
        alignment: draft.alignment ?? '',
        background: draft.background,
        proficiencyBonus,
        ac: 10 + dexterityModifier,
        initiative: dexterityModifier,
        speed: RACE_SPEED_MAP[draft.race] ?? 30,
        abilityScores: finalScores,
        hp: { max: maxHp, current: maxHp, temp: 0 },
        hitDice: { total: draft.level, remaining: draft.level, die: `d${hitDie}` },
        skillProficiencies: buildSkillProficiencies(draft),
        savingThrowProficiencies: CLASS_SAVING_THROWS[draft.class] ?? [],
        ...(spellcastingAbility ? { spellcastingAbility } : {}),
        ...(spellAttackBonus !== null ? { spellAttackBonus } : {}),
        ...(spellSaveDC !== null ? { spellSaveDC } : {}),
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
