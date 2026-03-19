export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AbilityScores = {
  __typename?: 'AbilityScores';
  charisma: Scalars['Int']['output'];
  constitution: Scalars['Int']['output'];
  dexterity: Scalars['Int']['output'];
  intelligence: Scalars['Int']['output'];
  strength: Scalars['Int']['output'];
  wisdom: Scalars['Int']['output'];
};

export type AbilityScoresInput = {
  charisma: Scalars['Int']['input'];
  constitution: Scalars['Int']['input'];
  dexterity: Scalars['Int']['input'];
  intelligence: Scalars['Int']['input'];
  strength: Scalars['Int']['input'];
  wisdom: Scalars['Int']['input'];
};

export type Attack = {
  __typename?: 'Attack';
  attackBonus: Scalars['String']['output'];
  damage: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type AttackInput = {
  attackBonus: Scalars['String']['input'];
  damage: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type Character = {
  __typename?: 'Character';
  ac: Scalars['Int']['output'];
  alignment: Scalars['String']['output'];
  attacks: Array<Attack>;
  background: Scalars['String']['output'];
  class: Scalars['String']['output'];
  conditions: Array<Scalars['String']['output']>;
  features: Array<CharacterFeature>;
  id: Scalars['ID']['output'];
  initiative: Scalars['Int']['output'];
  inspiration: Scalars['Boolean']['output'];
  inventory: Array<InventoryItem>;
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  notes: Scalars['String']['output'];
  proficiencyBonus: Scalars['Int']['output'];
  race: Scalars['String']['output'];
  speed: Scalars['Int']['output'];
  spellAttackBonus?: Maybe<Scalars['Int']['output']>;
  spellSaveDC?: Maybe<Scalars['Int']['output']>;
  spellSlots: Array<SpellSlot>;
  spellbook: Array<CharacterSpell>;
  spellcastingAbility?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<CharacterStats>;
  subclass?: Maybe<Scalars['String']['output']>;
  weapons: Array<Attack>;
};

export type CharacterFeature = {
  __typename?: 'CharacterFeature';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  recharge?: Maybe<Scalars['String']['output']>;
  source: Scalars['String']['output'];
  usesMax?: Maybe<Scalars['Int']['output']>;
  usesRemaining?: Maybe<Scalars['Int']['output']>;
};

export type CharacterSpell = {
  __typename?: 'CharacterSpell';
  prepared: Scalars['Boolean']['output'];
  spell: Spell;
};

export type CharacterStats = {
  __typename?: 'CharacterStats';
  abilityScores: AbilityScores;
  currency: Currency;
  deathSaves: DeathSaves;
  hitDice: HitDice;
  hp: Hp;
  id: Scalars['ID']['output'];
  savingThrowProficiencies: Array<Scalars['String']['output']>;
  skillProficiencies: SkillProficiencies;
  traits: Traits;
};

export type CreateCharacterInput = {
  abilityScores: AbilityScoresInput;
  ac: Scalars['Int']['input'];
  alignment: Scalars['String']['input'];
  background: Scalars['String']['input'];
  class: Scalars['String']['input'];
  currency?: InputMaybe<CurrencyInput>;
  hitDice: HitDiceInput;
  hp: HpInput;
  initiative: Scalars['Int']['input'];
  level: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  proficiencyBonus: Scalars['Int']['input'];
  race: Scalars['String']['input'];
  savingThrowProficiencies?: InputMaybe<Array<Scalars['String']['input']>>;
  skillProficiencies: SkillProficienciesInput;
  speed: Scalars['Int']['input'];
  spellAttackBonus?: InputMaybe<Scalars['Int']['input']>;
  spellSaveDC?: InputMaybe<Scalars['Int']['input']>;
  spellcastingAbility?: InputMaybe<Scalars['String']['input']>;
  subclass?: InputMaybe<Scalars['String']['input']>;
  traits?: InputMaybe<TraitsInput>;
};

export type Currency = {
  __typename?: 'Currency';
  cp: Scalars['Int']['output'];
  ep: Scalars['Int']['output'];
  gp: Scalars['Int']['output'];
  pp: Scalars['Int']['output'];
  sp: Scalars['Int']['output'];
};

export type CurrencyInput = {
  cp: Scalars['Int']['input'];
  ep: Scalars['Int']['input'];
  gp: Scalars['Int']['input'];
  pp: Scalars['Int']['input'];
  sp: Scalars['Int']['input'];
};

export type DeathSaves = {
  __typename?: 'DeathSaves';
  failures: Scalars['Int']['output'];
  successes: Scalars['Int']['output'];
};

export type DeathSavesInput = {
  failures: Scalars['Int']['input'];
  successes: Scalars['Int']['input'];
};

export type FeatureInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  recharge?: InputMaybe<Scalars['String']['input']>;
  source: Scalars['String']['input'];
  usesMax?: InputMaybe<Scalars['Int']['input']>;
  usesRemaining?: InputMaybe<Scalars['Int']['input']>;
};

export type Hp = {
  __typename?: 'HP';
  current: Scalars['Int']['output'];
  max: Scalars['Int']['output'];
  temp: Scalars['Int']['output'];
};

export type HpInput = {
  current: Scalars['Int']['input'];
  max: Scalars['Int']['input'];
  temp: Scalars['Int']['input'];
};

export type HitDice = {
  __typename?: 'HitDice';
  die: Scalars['String']['output'];
  remaining: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type HitDiceInput = {
  die: Scalars['String']['input'];
  remaining: Scalars['Int']['input'];
  total: Scalars['Int']['input'];
};

export type InventoryItem = {
  __typename?: 'InventoryItem';
  description?: Maybe<Scalars['String']['output']>;
  equipped: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  magical: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

export type InventoryItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipped?: InputMaybe<Scalars['Boolean']['input']>;
  magical?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addAttack: Attack;
  addFeature: CharacterFeature;
  addInventoryItem: InventoryItem;
  addWeapon: Attack;
  createCharacter: Character;
  deleteCharacter: Scalars['Boolean']['output'];
  forgetSpell: Scalars['Boolean']['output'];
  learnSpell: CharacterSpell;
  longRest: Character;
  prepareSpell: CharacterSpell;
  removeAttack: Scalars['Boolean']['output'];
  removeFeature: Scalars['Boolean']['output'];
  removeInventoryItem: Scalars['Boolean']['output'];
  removeWeapon: Scalars['Boolean']['output'];
  saveCharacterSheet: Character;
  shortRest: Character;
  spendHitDie: CharacterStats;
  toggleInspiration: Character;
  toggleSpellSlot: SpellSlot;
  unprepareSpell: CharacterSpell;
  updateAbilityScores: CharacterStats;
  updateCharacter: Character;
  updateCurrency: CharacterStats;
  updateDeathSaves: CharacterStats;
  updateFeature: CharacterFeature;
  updateHP: CharacterStats;
  updateHitDice: CharacterStats;
  updateInventoryItem: InventoryItem;
  updateSavingThrowProficiencies: CharacterStats;
  updateSkillProficiencies: CharacterStats;
  updateTraits: CharacterStats;
  updateWeapon: Attack;
};


export type MutationAddAttackArgs = {
  characterId: Scalars['ID']['input'];
  input: AttackInput;
};


export type MutationAddFeatureArgs = {
  characterId: Scalars['ID']['input'];
  input: FeatureInput;
};


export type MutationAddInventoryItemArgs = {
  characterId: Scalars['ID']['input'];
  input: InventoryItemInput;
};


export type MutationAddWeaponArgs = {
  characterId: Scalars['ID']['input'];
  input: AttackInput;
};


export type MutationCreateCharacterArgs = {
  input: CreateCharacterInput;
};


export type MutationDeleteCharacterArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgetSpellArgs = {
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
};


export type MutationLearnSpellArgs = {
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
};


export type MutationLongRestArgs = {
  characterId: Scalars['ID']['input'];
};


export type MutationPrepareSpellArgs = {
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
};


export type MutationRemoveAttackArgs = {
  attackId: Scalars['ID']['input'];
  characterId: Scalars['ID']['input'];
};


export type MutationRemoveFeatureArgs = {
  characterId: Scalars['ID']['input'];
  featureId: Scalars['ID']['input'];
};


export type MutationRemoveInventoryItemArgs = {
  characterId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type MutationRemoveWeaponArgs = {
  characterId: Scalars['ID']['input'];
  weaponId: Scalars['ID']['input'];
};


export type MutationSaveCharacterSheetArgs = {
  characterId: Scalars['ID']['input'];
  input: SaveCharacterSheetInput;
};


export type MutationShortRestArgs = {
  characterId: Scalars['ID']['input'];
};


export type MutationSpendHitDieArgs = {
  amount?: Scalars['Int']['input'];
  characterId: Scalars['ID']['input'];
};


export type MutationToggleInspirationArgs = {
  characterId: Scalars['ID']['input'];
};


export type MutationToggleSpellSlotArgs = {
  characterId: Scalars['ID']['input'];
  level: Scalars['Int']['input'];
};


export type MutationUnprepareSpellArgs = {
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
};


export type MutationUpdateAbilityScoresArgs = {
  characterId: Scalars['ID']['input'];
  input: AbilityScoresInput;
};


export type MutationUpdateCharacterArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCharacterInput;
};


export type MutationUpdateCurrencyArgs = {
  characterId: Scalars['ID']['input'];
  input: CurrencyInput;
};


export type MutationUpdateDeathSavesArgs = {
  characterId: Scalars['ID']['input'];
  input: DeathSavesInput;
};


export type MutationUpdateFeatureArgs = {
  characterId: Scalars['ID']['input'];
  featureId: Scalars['ID']['input'];
  input: FeatureInput;
};


export type MutationUpdateHpArgs = {
  characterId: Scalars['ID']['input'];
  input: HpInput;
};


export type MutationUpdateHitDiceArgs = {
  characterId: Scalars['ID']['input'];
  input: HitDiceInput;
};


export type MutationUpdateInventoryItemArgs = {
  characterId: Scalars['ID']['input'];
  input: InventoryItemInput;
  itemId: Scalars['ID']['input'];
};


export type MutationUpdateSavingThrowProficienciesArgs = {
  characterId: Scalars['ID']['input'];
  input: SavingThrowProficienciesInput;
};


export type MutationUpdateSkillProficienciesArgs = {
  characterId: Scalars['ID']['input'];
  input: SkillProficienciesInput;
};


export type MutationUpdateTraitsArgs = {
  characterId: Scalars['ID']['input'];
  input: TraitsInput;
};


export type MutationUpdateWeaponArgs = {
  characterId: Scalars['ID']['input'];
  input: AttackInput;
  weaponId: Scalars['ID']['input'];
};

export enum ProficiencyLevel {
  Expert = 'expert',
  None = 'none',
  Proficient = 'proficient'
}

export type Query = {
  __typename?: 'Query';
  character?: Maybe<Character>;
  currentUserCharacters: Array<Character>;
  spell?: Maybe<Spell>;
  spells: Array<Spell>;
};


export type QueryCharacterArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpellArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpellsArgs = {
  filter?: InputMaybe<SpellFilter>;
  pagination?: InputMaybe<SpellPagination>;
};

export type SaveCharacterSheetAttackInput = {
  attackBonus: Scalars['String']['input'];
  damage: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SaveCharacterSheetFeatureInput = {
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  recharge?: InputMaybe<Scalars['String']['input']>;
  source: Scalars['String']['input'];
  usesMax?: InputMaybe<Scalars['Int']['input']>;
  usesRemaining?: InputMaybe<Scalars['Int']['input']>;
};

export type SaveCharacterSheetInput = {
  abilityScores: AbilityScoresInput;
  ac: Scalars['Int']['input'];
  conditions: Array<Scalars['String']['input']>;
  currency: CurrencyInput;
  features: Array<SaveCharacterSheetFeatureInput>;
  hp: HpInput;
  initiative: Scalars['Int']['input'];
  inventory: Array<SaveCharacterSheetInventoryItemInput>;
  speed: Scalars['Int']['input'];
  spellAttackBonus?: InputMaybe<Scalars['Int']['input']>;
  spellSaveDC?: InputMaybe<Scalars['Int']['input']>;
  traits: TraitsInput;
  weapons: Array<SaveCharacterSheetAttackInput>;
};

export type SaveCharacterSheetInventoryItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipped: Scalars['Boolean']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  magical: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type SavingThrowProficienciesInput = {
  proficiencies: Array<Scalars['String']['input']>;
};

export type SkillProficiencies = {
  __typename?: 'SkillProficiencies';
  acrobatics: ProficiencyLevel;
  animalHandling: ProficiencyLevel;
  arcana: ProficiencyLevel;
  athletics: ProficiencyLevel;
  deception: ProficiencyLevel;
  history: ProficiencyLevel;
  insight: ProficiencyLevel;
  intimidation: ProficiencyLevel;
  investigation: ProficiencyLevel;
  medicine: ProficiencyLevel;
  nature: ProficiencyLevel;
  perception: ProficiencyLevel;
  performance: ProficiencyLevel;
  persuasion: ProficiencyLevel;
  religion: ProficiencyLevel;
  sleightOfHand: ProficiencyLevel;
  stealth: ProficiencyLevel;
  survival: ProficiencyLevel;
};

export type SkillProficienciesInput = {
  acrobatics?: InputMaybe<ProficiencyLevel>;
  animalHandling?: InputMaybe<ProficiencyLevel>;
  arcana?: InputMaybe<ProficiencyLevel>;
  athletics?: InputMaybe<ProficiencyLevel>;
  deception?: InputMaybe<ProficiencyLevel>;
  history?: InputMaybe<ProficiencyLevel>;
  insight?: InputMaybe<ProficiencyLevel>;
  intimidation?: InputMaybe<ProficiencyLevel>;
  investigation?: InputMaybe<ProficiencyLevel>;
  medicine?: InputMaybe<ProficiencyLevel>;
  nature?: InputMaybe<ProficiencyLevel>;
  perception?: InputMaybe<ProficiencyLevel>;
  performance?: InputMaybe<ProficiencyLevel>;
  persuasion?: InputMaybe<ProficiencyLevel>;
  religion?: InputMaybe<ProficiencyLevel>;
  sleightOfHand?: InputMaybe<ProficiencyLevel>;
  stealth?: InputMaybe<ProficiencyLevel>;
  survival?: InputMaybe<ProficiencyLevel>;
};

export type Spell = {
  __typename?: 'Spell';
  castingTime: Scalars['String']['output'];
  classIndexes: Array<Scalars['String']['output']>;
  components: Array<Scalars['String']['output']>;
  concentration: Scalars['Boolean']['output'];
  description: Array<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  higherLevel: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  material?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  range?: Maybe<Scalars['String']['output']>;
  ritual: Scalars['Boolean']['output'];
  schoolIndex: Scalars['String']['output'];
  sourceBook?: Maybe<Scalars['String']['output']>;
};

export type SpellFilter = {
  castingTimeCategories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  classes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  components?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  concentration?: InputMaybe<Scalars['Boolean']['input']>;
  durationCategories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasHigherLevel?: InputMaybe<Scalars['Boolean']['input']>;
  hasMaterial?: InputMaybe<Scalars['Boolean']['input']>;
  levels?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  rangeCategories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ritual?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SpellPagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type SpellSlot = {
  __typename?: 'SpellSlot';
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  used: Scalars['Int']['output'];
};

export type Traits = {
  __typename?: 'Traits';
  armorProficiencies?: Maybe<Array<Scalars['String']['output']>>;
  bonds: Scalars['String']['output'];
  flaws: Scalars['String']['output'];
  ideals: Scalars['String']['output'];
  languages?: Maybe<Array<Scalars['String']['output']>>;
  personality: Scalars['String']['output'];
  toolProficiencies?: Maybe<Array<Scalars['String']['output']>>;
  weaponProficiencies?: Maybe<Array<Scalars['String']['output']>>;
};

export type TraitsInput = {
  armorProficiencies?: InputMaybe<Array<Scalars['String']['input']>>;
  bonds: Scalars['String']['input'];
  flaws: Scalars['String']['input'];
  ideals: Scalars['String']['input'];
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  personality: Scalars['String']['input'];
  toolProficiencies?: InputMaybe<Array<Scalars['String']['input']>>;
  weaponProficiencies?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateCharacterInput = {
  ac?: InputMaybe<Scalars['Int']['input']>;
  alignment?: InputMaybe<Scalars['String']['input']>;
  background?: InputMaybe<Scalars['String']['input']>;
  class?: InputMaybe<Scalars['String']['input']>;
  conditions?: InputMaybe<Array<Scalars['String']['input']>>;
  initiative?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  proficiencyBonus?: InputMaybe<Scalars['Int']['input']>;
  race?: InputMaybe<Scalars['String']['input']>;
  speed?: InputMaybe<Scalars['Int']['input']>;
  spellAttackBonus?: InputMaybe<Scalars['Int']['input']>;
  spellSaveDC?: InputMaybe<Scalars['Int']['input']>;
  spellcastingAbility?: InputMaybe<Scalars['String']['input']>;
  subclass?: InputMaybe<Scalars['String']['input']>;
};

export type SpellsQueryVariables = Exact<{
  filter?: InputMaybe<SpellFilter>;
  pagination?: InputMaybe<SpellPagination>;
}>;


export type SpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean }> };

export type SpellQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpellQuery = { __typename?: 'Query', spell?: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, description: Array<string>, higherLevel: Array<string>, range?: string | null, components: Array<string>, material?: string | null, ritual: boolean, duration?: string | null, concentration: boolean, castingTime: string } | null };

export type AddSpellSheetSpellsQueryVariables = Exact<{
  filter?: InputMaybe<SpellFilter>;
  pagination?: InputMaybe<SpellPagination>;
}>;


export type AddSpellSheetSpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', classIndexes: Array<string>, id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean }> };

export type AddSpellSheetSpellDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AddSpellSheetSpellDetailQuery = { __typename?: 'Query', spell?: { __typename?: 'Spell', classIndexes: Array<string>, description: Array<string>, higherLevel: Array<string>, components: Array<string>, material?: string | null, duration?: string | null, id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } | null };

export type CharacterRosterFieldsFragment = { __typename?: 'Character', id: string, name: string, race: string, class: string, subclass?: string | null, level: number, spellAttackBonus?: number | null, initiative: number, ac: number, conditions: Array<string>, weapons: Array<{ __typename?: 'Attack', attackBonus: string }>, stats?: { __typename?: 'CharacterStats', hp: { __typename?: 'HP', current: number, max: number } } | null };

export type CharacterSheetFieldsFragment = { __typename?: 'Character', id: string, name: string, race: string, class: string, subclass?: string | null, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, spellcastingAbility?: string | null, spellSaveDC?: number | null, spellAttackBonus?: number | null, conditions: Array<string>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Attack', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDice: { __typename?: 'HitDice', total: number, remaining: number, die: string }, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null };

export type CurrentUserCharacterRosterQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserCharacterRosterQuery = { __typename?: 'Query', currentUserCharacters: Array<{ __typename?: 'Character', id: string, name: string, race: string, class: string, subclass?: string | null, level: number, spellAttackBonus?: number | null, initiative: number, ac: number, conditions: Array<string>, weapons: Array<{ __typename?: 'Attack', attackBonus: string }>, stats?: { __typename?: 'CharacterStats', hp: { __typename?: 'HP', current: number, max: number } } | null }> };

export type CurrentUserCharacterSheetsQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserCharacterSheetsQuery = { __typename?: 'Query', currentUserCharacters: Array<{ __typename?: 'Character', id: string, name: string, race: string, class: string, subclass?: string | null, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, spellcastingAbility?: string | null, spellSaveDC?: number | null, spellAttackBonus?: number | null, conditions: Array<string>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Attack', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDice: { __typename?: 'HitDice', total: number, remaining: number, die: string }, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null }> };

export type SaveCharacterSheetMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: SaveCharacterSheetInput;
}>;


export type SaveCharacterSheetMutation = { __typename?: 'Mutation', saveCharacterSheet: { __typename?: 'Character', id: string, name: string, race: string, class: string, subclass?: string | null, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, spellcastingAbility?: string | null, spellSaveDC?: number | null, spellAttackBonus?: number | null, conditions: Array<string>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Attack', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDice: { __typename?: 'HitDice', total: number, remaining: number, die: string }, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null } };

export type AddWeaponMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: AttackInput;
}>;


export type AddWeaponMutation = { __typename?: 'Mutation', addWeapon: { __typename?: 'Attack', id: string, name: string, attackBonus: string, damage: string, type: string } };

export type UpdateWeaponMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  weaponId: Scalars['ID']['input'];
  input: AttackInput;
}>;


export type UpdateWeaponMutation = { __typename?: 'Mutation', updateWeapon: { __typename?: 'Attack', id: string, name: string, attackBonus: string, damage: string, type: string } };

export type RemoveWeaponMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  weaponId: Scalars['ID']['input'];
}>;


export type RemoveWeaponMutation = { __typename?: 'Mutation', removeWeapon: boolean };

export type AddInventoryItemMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: InventoryItemInput;
}>;


export type AddInventoryItemMutation = { __typename?: 'Mutation', addInventoryItem: { __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean } };

export type UpdateInventoryItemMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: InventoryItemInput;
}>;


export type UpdateInventoryItemMutation = { __typename?: 'Mutation', updateInventoryItem: { __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean } };

export type RemoveInventoryItemMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type RemoveInventoryItemMutation = { __typename?: 'Mutation', removeInventoryItem: boolean };

export type AddFeatureMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: FeatureInput;
}>;


export type AddFeatureMutation = { __typename?: 'Mutation', addFeature: { __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null } };

export type UpdateFeatureMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  featureId: Scalars['ID']['input'];
  input: FeatureInput;
}>;


export type UpdateFeatureMutation = { __typename?: 'Mutation', updateFeature: { __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null } };

export type RemoveFeatureMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  featureId: Scalars['ID']['input'];
}>;


export type RemoveFeatureMutation = { __typename?: 'Mutation', removeFeature: boolean };

export type UpdateCharacterMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCharacterInput;
}>;


export type UpdateCharacterMutation = { __typename?: 'Mutation', updateCharacter: { __typename?: 'Character', id: string, level: number, proficiencyBonus: number, ac: number, speed: number, initiative: number, conditions: Array<string>, spellSaveDC?: number | null, spellAttackBonus?: number | null } };

export type UpdateHpMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: HpInput;
}>;


export type UpdateHpMutation = { __typename?: 'Mutation', updateHP: { __typename?: 'CharacterStats', id: string, hp: { __typename?: 'HP', current: number, max: number, temp: number } } };

export type UpdateAbilityScoresMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: AbilityScoresInput;
}>;


export type UpdateAbilityScoresMutation = { __typename?: 'Mutation', updateAbilityScores: { __typename?: 'CharacterStats', id: string, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number } } };

export type UpdateCurrencyMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: CurrencyInput;
}>;


export type UpdateCurrencyMutation = { __typename?: 'Mutation', updateCurrency: { __typename?: 'CharacterStats', id: string, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } };

export type UpdateTraitsMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: TraitsInput;
}>;


export type UpdateTraitsMutation = { __typename?: 'Mutation', updateTraits: { __typename?: 'CharacterStats', id: string, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null } } };

export type CreateCharacterMutationVariables = Exact<{
  input: CreateCharacterInput;
}>;


export type CreateCharacterMutation = { __typename?: 'Mutation', createCharacter: { __typename?: 'Character', id: string, name: string } };

export type ToggleInspirationMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type ToggleInspirationMutation = { __typename?: 'Mutation', toggleInspiration: { __typename?: 'Character', id: string, inspiration: boolean } };

export type UpdateDeathSavesMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: DeathSavesInput;
}>;


export type UpdateDeathSavesMutation = { __typename?: 'Mutation', updateDeathSaves: { __typename?: 'CharacterStats', id: string, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number } } };

export type UpdateSkillProficienciesMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: SkillProficienciesInput;
}>;


export type UpdateSkillProficienciesMutation = { __typename?: 'Mutation', updateSkillProficiencies: { __typename?: 'CharacterStats', id: string, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel } } };

export type UpdateSavingThrowProficienciesMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: SavingThrowProficienciesInput;
}>;


export type UpdateSavingThrowProficienciesMutation = { __typename?: 'Mutation', updateSavingThrowProficiencies: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string> } };

export type ToggleSpellSlotMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  level: Scalars['Int']['input'];
}>;


export type ToggleSpellSlotMutation = { __typename?: 'Mutation', toggleSpellSlot: { __typename?: 'SpellSlot', id: string, level: number, total: number, used: number } };

export type LearnSpellMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type LearnSpellMutation = { __typename?: 'Mutation', learnSpell: { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } } };

export type ForgetSpellMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type ForgetSpellMutation = { __typename?: 'Mutation', forgetSpell: boolean };

export type PrepareSpellMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type PrepareSpellMutation = { __typename?: 'Mutation', prepareSpell: { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string } } };

export type UnprepareSpellMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type UnprepareSpellMutation = { __typename?: 'Mutation', unprepareSpell: { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string } } };

export type SpellListFieldsFragment = { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean };

export type CharacterSpellbookEntryFieldsFragment = { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } };
