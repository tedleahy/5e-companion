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
