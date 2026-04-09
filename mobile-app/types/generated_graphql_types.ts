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

export type AvailableSubclass = {
  __typename?: 'AvailableSubclass';
  classId: Scalars['String']['output'];
  className: Scalars['String']['output'];
  description: Array<Scalars['String']['output']>;
  features: Array<AvailableSubclassFeature>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type AvailableSubclassFeature = {
  __typename?: 'AvailableSubclassFeature';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Character = {
  __typename?: 'Character';
  ac: Scalars['Int']['output'];
  alignment: Scalars['String']['output'];
  background: Scalars['String']['output'];
  classes: Array<CharacterClass>;
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
  spellSlots: Array<SpellSlot>;
  spellbook: Array<CharacterSpell>;
  spellcastingProfiles: Array<SpellcastingProfile>;
  stats?: Maybe<CharacterStats>;
  weapons: Array<Weapon>;
};

export type CharacterClass = {
  __typename?: 'CharacterClass';
  classId: Scalars['String']['output'];
  className: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isStartingClass: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  subclassId?: Maybe<Scalars['String']['output']>;
  subclassName?: Maybe<Scalars['String']['output']>;
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
  hitDicePools: Array<HitDicePool>;
  hp: Hp;
  id: Scalars['ID']['output'];
  savingThrowProficiencies: Array<Scalars['String']['output']>;
  skillProficiencies: SkillProficiencies;
  traits: Traits;
};

export type CreateCharacterClassInput = {
  classId: Scalars['String']['input'];
  customSubclass?: InputMaybe<CustomSubclassInput>;
  level: Scalars['Int']['input'];
  subclassId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCharacterInput = {
  abilityScores: AbilityScoresInput;
  ac: Scalars['Int']['input'];
  alignment: Scalars['String']['input'];
  background: Scalars['String']['input'];
  classes: Array<CreateCharacterClassInput>;
  currency?: InputMaybe<CurrencyInput>;
  initiative: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  race: Scalars['String']['input'];
  skillProficiencies: SkillProficienciesInput;
  speed: Scalars['Int']['input'];
  startingClassId: Scalars['String']['input'];
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

export type CustomSubclassInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
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

export type HitDicePool = {
  __typename?: 'HitDicePool';
  classId: Scalars['String']['output'];
  className: Scalars['String']['output'];
  die: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  remaining: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type HitDicePoolInput = {
  classId: Scalars['String']['input'];
  remaining: Scalars['Int']['input'];
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
  createCharacter: Character;
  deleteCharacter: Scalars['Boolean']['output'];
  forgetSpell: Scalars['Boolean']['output'];
  learnSpell: CharacterSpell;
  longRest: Character;
  prepareSpell: CharacterSpell;
  saveCharacterSheet: Character;
  shortRest: Character;
  spendHitDie: CharacterStats;
  toggleInspiration: Character;
  toggleSpellSlot: SpellSlot;
  unprepareSpell: CharacterSpell;
  updateCharacter: Character;
  updateDeathSaves: CharacterStats;
  updateHitDice: CharacterStats;
  updateInventoryItem: InventoryItem;
  updateSavingThrowProficiencies: CharacterStats;
  updateSkillProficiencies: CharacterStats;
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
  classId: Scalars['String']['input'];
};


export type MutationToggleInspirationArgs = {
  characterId: Scalars['ID']['input'];
};


export type MutationToggleSpellSlotArgs = {
  characterId: Scalars['ID']['input'];
  kind: SpellSlotKind;
  level: Scalars['Int']['input'];
};


export type MutationUnprepareSpellArgs = {
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
};


export type MutationUpdateCharacterArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCharacterInput;
};


export type MutationUpdateDeathSavesArgs = {
  characterId: Scalars['ID']['input'];
  input: DeathSavesInput;
};


export type MutationUpdateHitDiceArgs = {
  characterId: Scalars['ID']['input'];
  input: Array<HitDicePoolInput>;
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

export enum ProficiencyLevel {
  Expert = 'expert',
  None = 'none',
  Proficient = 'proficient'
}

export type Query = {
  __typename?: 'Query';
  availableSubclasses: Array<AvailableSubclass>;
  character?: Maybe<Character>;
  currentUserCharacters: Array<Character>;
  hasCurrentUserCharacters: Scalars['Boolean']['output'];
  spell?: Maybe<Spell>;
  spells: Array<Spell>;
};


export type QueryAvailableSubclassesArgs = {
  classIds?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type SaveCharacterSheetClassInput = {
  classId: Scalars['String']['input'];
  customSubclass?: InputMaybe<CustomSubclassInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isStartingClass: Scalars['Boolean']['input'];
  level: Scalars['Int']['input'];
  subclassId?: InputMaybe<Scalars['String']['input']>;
};

export type SaveCharacterSheetFeatureInput = {
  customSubclassFeature?: InputMaybe<SaveCustomSubclassFeatureInput>;
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
  classes: Array<SaveCharacterSheetClassInput>;
  conditions: Array<Scalars['String']['input']>;
  currency: CurrencyInput;
  features: Array<SaveCharacterSheetFeatureInput>;
  hp: HpInput;
  initiative: Scalars['Int']['input'];
  inventory: Array<SaveCharacterSheetInventoryItemInput>;
  speed: Scalars['Int']['input'];
  traits: TraitsInput;
  weapons: Array<SaveCharacterSheetWeaponInput>;
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

export type SaveCharacterSheetWeaponInput = {
  attackBonus: Scalars['String']['input'];
  damage: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SaveCustomSubclassFeatureInput = {
  classId: Scalars['String']['input'];
  level: Scalars['Int']['input'];
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
  schools?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SpellPagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type SpellSlot = {
  __typename?: 'SpellSlot';
  id: Scalars['ID']['output'];
  kind: SpellSlotKind;
  level: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  used: Scalars['Int']['output'];
};

export enum SpellSlotKind {
  PactMagic = 'PACT_MAGIC',
  Standard = 'STANDARD'
}

export type SpellcastingProfile = {
  __typename?: 'SpellcastingProfile';
  classId: Scalars['String']['output'];
  classLevel: Scalars['Int']['output'];
  className: Scalars['String']['output'];
  slotKind: SpellSlotKind;
  spellAttackBonus: Scalars['Int']['output'];
  spellSaveDC: Scalars['Int']['output'];
  spellcastingAbility: Scalars['String']['output'];
  subclassId?: Maybe<Scalars['String']['output']>;
  subclassName?: Maybe<Scalars['String']['output']>;
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
  conditions?: InputMaybe<Array<Scalars['String']['input']>>;
  initiative?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  race?: InputMaybe<Scalars['String']['input']>;
  speed?: InputMaybe<Scalars['Int']['input']>;
};

export type Weapon = {
  __typename?: 'Weapon';
  attackBonus: Scalars['String']['output'];
  damage: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type WeaponInput = {
  attackBonus: Scalars['String']['input'];
  damage: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SpellsQueryVariables = Exact<{
  filter?: InputMaybe<SpellFilter>;
  pagination?: InputMaybe<SpellPagination>;
}>;


export type SpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean }> };

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

export type CharacterRosterFieldsFragment = { __typename?: 'Character', id: string, name: string, race: string, level: number, initiative: number, ac: number, conditions: Array<string>, classes: Array<{ __typename?: 'CharacterClass', id: string, classId: string, className: string, subclassId?: string | null, subclassName?: string | null, level: number, isStartingClass: boolean }>, spellcastingProfiles: Array<{ __typename?: 'SpellcastingProfile', classId: string, spellAttackBonus: number }>, weapons: Array<{ __typename?: 'Weapon', attackBonus: string }>, stats?: { __typename?: 'CharacterStats', hp: { __typename?: 'HP', current: number, max: number } } | null };

export type CharacterSheetFieldsFragment = { __typename?: 'Character', id: string, name: string, race: string, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, conditions: Array<string>, classes: Array<{ __typename?: 'CharacterClass', id: string, classId: string, className: string, subclassId?: string | null, subclassName?: string | null, level: number, isStartingClass: boolean }>, spellcastingProfiles: Array<{ __typename?: 'SpellcastingProfile', classId: string, className: string, subclassId?: string | null, subclassName?: string | null, classLevel: number, spellcastingAbility: string, spellSaveDC: number, spellAttackBonus: number, slotKind: SpellSlotKind }>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Weapon', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, kind: SpellSlotKind, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDicePools: Array<{ __typename?: 'HitDicePool', id: string, classId: string, className: string, total: number, remaining: number, die: string }>, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null };

export type CurrentUserCharacterRosterQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserCharacterRosterQuery = { __typename?: 'Query', currentUserCharacters: Array<{ __typename?: 'Character', id: string, name: string, race: string, level: number, initiative: number, ac: number, conditions: Array<string>, classes: Array<{ __typename?: 'CharacterClass', id: string, classId: string, className: string, subclassId?: string | null, subclassName?: string | null, level: number, isStartingClass: boolean }>, spellcastingProfiles: Array<{ __typename?: 'SpellcastingProfile', classId: string, spellAttackBonus: number }>, weapons: Array<{ __typename?: 'Weapon', attackBonus: string }>, stats?: { __typename?: 'CharacterStats', hp: { __typename?: 'HP', current: number, max: number } } | null }> };

export type CharacterSheetDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CharacterSheetDetailQuery = { __typename?: 'Query', hasCurrentUserCharacters: boolean, character?: { __typename?: 'Character', id: string, name: string, race: string, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, conditions: Array<string>, classes: Array<{ __typename?: 'CharacterClass', id: string, classId: string, className: string, subclassId?: string | null, subclassName?: string | null, level: number, isStartingClass: boolean }>, spellcastingProfiles: Array<{ __typename?: 'SpellcastingProfile', classId: string, className: string, subclassId?: string | null, subclassName?: string | null, classLevel: number, spellcastingAbility: string, spellSaveDC: number, spellAttackBonus: number, slotKind: SpellSlotKind }>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Weapon', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, kind: SpellSlotKind, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDicePools: Array<{ __typename?: 'HitDicePool', id: string, classId: string, className: string, total: number, remaining: number, die: string }>, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null } | null };

export type SaveCharacterSheetMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  input: SaveCharacterSheetInput;
}>;


export type SaveCharacterSheetMutation = { __typename?: 'Mutation', saveCharacterSheet: { __typename?: 'Character', id: string, name: string, race: string, level: number, alignment: string, background: string, proficiencyBonus: number, inspiration: boolean, ac: number, speed: number, initiative: number, conditions: Array<string>, classes: Array<{ __typename?: 'CharacterClass', id: string, classId: string, className: string, subclassId?: string | null, subclassName?: string | null, level: number, isStartingClass: boolean }>, spellcastingProfiles: Array<{ __typename?: 'SpellcastingProfile', classId: string, className: string, subclassId?: string | null, subclassName?: string | null, classLevel: number, spellcastingAbility: string, spellSaveDC: number, spellAttackBonus: number, slotKind: SpellSlotKind }>, features: Array<{ __typename?: 'CharacterFeature', id: string, name: string, source: string, description: string, usesMax?: number | null, usesRemaining?: number | null, recharge?: string | null }>, weapons: Array<{ __typename?: 'Weapon', id: string, name: string, attackBonus: string, damage: string, type: string }>, inventory: Array<{ __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean }>, spellSlots: Array<{ __typename?: 'SpellSlot', id: string, kind: SpellSlotKind, level: number, total: number, used: number }>, spellbook: Array<{ __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } }>, stats?: { __typename?: 'CharacterStats', id: string, savingThrowProficiencies: Array<string>, abilityScores: { __typename?: 'AbilityScores', strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number }, hp: { __typename?: 'HP', current: number, max: number, temp: number }, deathSaves: { __typename?: 'DeathSaves', successes: number, failures: number }, hitDicePools: Array<{ __typename?: 'HitDicePool', id: string, classId: string, className: string, total: number, remaining: number, die: string }>, traits: { __typename?: 'Traits', personality: string, ideals: string, bonds: string, flaws: string, armorProficiencies?: Array<string> | null, weaponProficiencies?: Array<string> | null, toolProficiencies?: Array<string> | null, languages?: Array<string> | null }, skillProficiencies: { __typename?: 'SkillProficiencies', acrobatics: ProficiencyLevel, animalHandling: ProficiencyLevel, arcana: ProficiencyLevel, athletics: ProficiencyLevel, deception: ProficiencyLevel, history: ProficiencyLevel, insight: ProficiencyLevel, intimidation: ProficiencyLevel, investigation: ProficiencyLevel, medicine: ProficiencyLevel, nature: ProficiencyLevel, perception: ProficiencyLevel, performance: ProficiencyLevel, persuasion: ProficiencyLevel, religion: ProficiencyLevel, sleightOfHand: ProficiencyLevel, stealth: ProficiencyLevel, survival: ProficiencyLevel }, currency: { __typename?: 'Currency', cp: number, sp: number, ep: number, gp: number, pp: number } } | null } };

export type UpdateInventoryItemMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: InventoryItemInput;
}>;


export type UpdateInventoryItemMutation = { __typename?: 'Mutation', updateInventoryItem: { __typename?: 'InventoryItem', id: string, name: string, quantity: number, weight?: number | null, description?: string | null, equipped: boolean, magical: boolean } };

export type AvailableSubclassesQueryVariables = Exact<{
  classIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type AvailableSubclassesQuery = { __typename?: 'Query', availableSubclasses: Array<{ __typename?: 'AvailableSubclass', id: string, value: string, srdIndex?: string | null, classId: string, className: string, name: string, description: Array<string>, isCustom: boolean, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> }> };

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
  kind: SpellSlotKind;
  level: Scalars['Int']['input'];
}>;


export type ToggleSpellSlotMutation = { __typename?: 'Mutation', toggleSpellSlot: { __typename?: 'SpellSlot', id: string, kind: SpellSlotKind, level: number, total: number, used: number } };

export type LearnSpellMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type LearnSpellMutation = { __typename?: 'Mutation', learnSpell: { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } } };

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

export type SpellListFieldsFragment = { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean };

export type CharacterSpellbookEntryFieldsFragment = { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } };
