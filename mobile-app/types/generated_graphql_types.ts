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

export type AvailableBackground = {
  __typename?: 'AvailableBackground';
  description: Scalars['String']['output'];
  featureName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type AvailableClass = {
  __typename?: 'AvailableClass';
  description: Array<Scalars['String']['output']>;
  emoji: Scalars['String']['output'];
  hitDie: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  multiclassPrerequisites: Array<ClassMulticlassPrerequisite>;
  name: Scalars['String']['output'];
  primaryAbilityIndexes: Array<Scalars['String']['output']>;
  savingThrowIndexes: Array<Scalars['String']['output']>;
  spellcastingAbility?: Maybe<Scalars['String']['output']>;
  spellcastingMode: Scalars['String']['output'];
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
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
  selectionLevel: Scalars['Int']['output'];
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
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isStartingClass: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  srdIndex?: Maybe<Scalars['String']['output']>;
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

export type ClassDetails = {
  __typename?: 'ClassDetails';
  addSpellcastingAbility: Scalars['Boolean']['output'];
  archived: Scalars['Boolean']['output'];
  characterUsageCount: Scalars['Int']['output'];
  description: Array<Scalars['String']['output']>;
  emoji: Scalars['String']['output'];
  equipment: Array<ClassEquipmentDefinition>;
  features: Array<ClassFeature>;
  hitDie: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  mechanicsLocked: Scalars['Boolean']['output'];
  mechanicsLockedReason?: Maybe<Scalars['String']['output']>;
  multiclassPrerequisites: Array<ClassMulticlassPrerequisite>;
  name: Scalars['String']['output'];
  primaryAbilityIndexes: Array<Scalars['String']['output']>;
  proficiencies: Array<ClassProficiency>;
  progression: Array<ClassLevelProgression>;
  savingThrowIndexes: Array<Scalars['String']['output']>;
  sourceBook?: Maybe<Scalars['String']['output']>;
  spellcastingAbility?: Maybe<Scalars['String']['output']>;
  spellcastingMode: Scalars['String']['output'];
  spells: Array<ClassSpell>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type ClassDisplayValue = {
  __typename?: 'ClassDisplayValue';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ClassDisplayValueInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type ClassEquipmentDefinition = {
  __typename?: 'ClassEquipmentDefinition';
  choiceCount?: Maybe<Scalars['Int']['output']>;
  choiceGroup?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type ClassEquipmentDefinitionInput = {
  choiceCount?: InputMaybe<Scalars['Int']['input']>;
  choiceGroup?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type ClassFeature = {
  __typename?: 'ClassFeature';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type ClassLevelProgression = {
  __typename?: 'ClassLevelProgression';
  abilityScoreImprovement: Scalars['Boolean']['output'];
  cantripsKnown?: Maybe<Scalars['Int']['output']>;
  displayValues: Array<ClassDisplayValue>;
  level: Scalars['Int']['output'];
  preparedSpellCount?: Maybe<Scalars['Int']['output']>;
  spellSlots: Array<Scalars['Int']['output']>;
  spellsKnown?: Maybe<Scalars['Int']['output']>;
};

export type ClassLevelProgressionInput = {
  abilityScoreImprovement: Scalars['Boolean']['input'];
  cantripsKnown?: InputMaybe<Scalars['Int']['input']>;
  displayValues: Array<ClassDisplayValueInput>;
  level: Scalars['Int']['input'];
  preparedSpellCount?: InputMaybe<Scalars['Int']['input']>;
  spellSlots: Array<Scalars['Int']['input']>;
  spellsKnown?: InputMaybe<Scalars['Int']['input']>;
};

export type ClassMulticlassPrerequisite = {
  __typename?: 'ClassMulticlassPrerequisite';
  abilityIndex: Scalars['String']['output'];
  group: Scalars['Int']['output'];
  minimum: Scalars['Int']['output'];
};

export type ClassMulticlassPrerequisiteInput = {
  abilityIndex: Scalars['String']['input'];
  group: Scalars['Int']['input'];
  minimum: Scalars['Int']['input'];
};

export type ClassProficiency = {
  __typename?: 'ClassProficiency';
  choiceCount?: Maybe<Scalars['Int']['output']>;
  choiceGroup?: Maybe<Scalars['Int']['output']>;
  grant: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ClassProficiencyInput = {
  choiceCount?: InputMaybe<Scalars['Int']['input']>;
  choiceGroup?: InputMaybe<Scalars['Int']['input']>;
  grant: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type ClassSpell = {
  __typename?: 'ClassSpell';
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type CompendiumAbilityBonus = {
  __typename?: 'CompendiumAbilityBonus';
  abilityIndex: Scalars['String']['output'];
  abilityName: Scalars['String']['output'];
  bonus: Scalars['Int']['output'];
};

export type CompendiumBackground = {
  __typename?: 'CompendiumBackground';
  characterUsageCount: Scalars['Int']['output'];
  featureDescription: Array<Scalars['String']['output']>;
  featureName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  languageChoiceCount: Scalars['Int']['output'];
  languages: Array<CompendiumReference>;
  name: Scalars['String']['output'];
  proficiencies: Array<CompendiumProficiency>;
  sourceBook?: Maybe<Scalars['String']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  startingEquipment: Array<CompendiumEquipment>;
  suggestedCharacteristics?: Maybe<CompendiumSuggestedCharacteristics>;
  value: Scalars['String']['output'];
};

export type CompendiumCharacteristicOptions = {
  __typename?: 'CompendiumCharacteristicOptions';
  choose: Scalars['Int']['output'];
  options: Array<Scalars['String']['output']>;
};

export type CompendiumCounts = {
  __typename?: 'CompendiumCounts';
  customBackgroundCount: Scalars['Int']['output'];
  customClassCount: Scalars['Int']['output'];
  customFeatCount: Scalars['Int']['output'];
  customLanguageCount: Scalars['Int']['output'];
  customRaceCount: Scalars['Int']['output'];
  customSubclassCount: Scalars['Int']['output'];
  customSubraceCount: Scalars['Int']['output'];
  spellCount: Scalars['Int']['output'];
  srdBackgroundCount: Scalars['Int']['output'];
  srdClassCount: Scalars['Int']['output'];
  srdFeatCount: Scalars['Int']['output'];
  srdLanguageCount: Scalars['Int']['output'];
  srdRaceCount: Scalars['Int']['output'];
  srdSubclassCount: Scalars['Int']['output'];
  srdSubraceCount: Scalars['Int']['output'];
};

export type CompendiumEquipment = {
  __typename?: 'CompendiumEquipment';
  choiceCount?: Maybe<Scalars['Int']['output']>;
  choiceGroup?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type CompendiumFeat = {
  __typename?: 'CompendiumFeat';
  characterUsageCount: Scalars['Int']['output'];
  description: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  prerequisiteSummary?: Maybe<Scalars['String']['output']>;
  prerequisites: Array<CompendiumFeatPrerequisite>;
  sourceBook?: Maybe<Scalars['String']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type CompendiumFeatPrerequisite = {
  __typename?: 'CompendiumFeatPrerequisite';
  abilityIndex: Scalars['String']['output'];
  abilityName: Scalars['String']['output'];
  minimumScore: Scalars['Int']['output'];
};

export type CompendiumLanguage = {
  __typename?: 'CompendiumLanguage';
  characterUsageCount: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  grantingBackgrounds: Array<CompendiumReference>;
  grantingRaces: Array<CompendiumReference>;
  grantingTraits: Array<CompendiumReference>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sameScriptLanguages: Array<CompendiumReference>;
  script?: Maybe<Scalars['String']['output']>;
  sourceBook?: Maybe<Scalars['String']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  typicalSpeakers: Array<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type CompendiumParentRace = {
  __typename?: 'CompendiumParentRace';
  abilityBonuses: Array<CompendiumAbilityBonus>;
  abilitySummary?: Maybe<Scalars['String']['output']>;
  languageChoiceCount: Scalars['Int']['output'];
  languageDescription?: Maybe<Scalars['String']['output']>;
  languages: Array<CompendiumReference>;
  name: Scalars['String']['output'];
  size?: Maybe<Scalars['String']['output']>;
  speed?: Maybe<Scalars['Int']['output']>;
  traits: Array<CompendiumTrait>;
  value: Scalars['String']['output'];
};

export type CompendiumProficiency = {
  __typename?: 'CompendiumProficiency';
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CompendiumRace = {
  __typename?: 'CompendiumRace';
  abilityBonuses: Array<CompendiumAbilityBonus>;
  abilitySummary?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['String']['output']>;
  alignment?: Maybe<Scalars['String']['output']>;
  characterUsageCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  languageChoiceCount: Scalars['Int']['output'];
  languageDescription?: Maybe<Scalars['String']['output']>;
  languages: Array<CompendiumReference>;
  name: Scalars['String']['output'];
  size?: Maybe<Scalars['String']['output']>;
  sizeDescription?: Maybe<Scalars['String']['output']>;
  sourceBook?: Maybe<Scalars['String']['output']>;
  speed?: Maybe<Scalars['Int']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  subraces: Array<CompendiumSubraceSummary>;
  traits: Array<CompendiumTrait>;
  value: Scalars['String']['output'];
};

export type CompendiumReference = {
  __typename?: 'CompendiumReference';
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CompendiumSubclass = {
  __typename?: 'CompendiumSubclass';
  canChangeClass: Scalars['Boolean']['output'];
  cannotChangeClassReason?: Maybe<Scalars['String']['output']>;
  characterUsageCount: Scalars['Int']['output'];
  classId: Scalars['String']['output'];
  className: Scalars['String']['output'];
  description: Array<Scalars['String']['output']>;
  features: Array<AvailableSubclassFeature>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  selectionLevel: Scalars['Int']['output'];
  sourceBook?: Maybe<Scalars['String']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type CompendiumSubrace = {
  __typename?: 'CompendiumSubrace';
  abilityBonuses: Array<CompendiumAbilityBonus>;
  abilitySummary?: Maybe<Scalars['String']['output']>;
  characterUsageCount: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentRace: CompendiumParentRace;
  sourceBook?: Maybe<Scalars['String']['output']>;
  srdIndex?: Maybe<Scalars['String']['output']>;
  traits: Array<CompendiumTrait>;
  value: Scalars['String']['output'];
};

export type CompendiumSubraceSummary = {
  __typename?: 'CompendiumSubraceSummary';
  abilityBonuses: Array<CompendiumAbilityBonus>;
  abilitySummary?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  traitCount: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type CompendiumSuggestedCharacteristics = {
  __typename?: 'CompendiumSuggestedCharacteristics';
  bonds?: Maybe<CompendiumCharacteristicOptions>;
  flaws?: Maybe<CompendiumCharacteristicOptions>;
  ideals?: Maybe<CompendiumCharacteristicOptions>;
  personalityTraits?: Maybe<CompendiumCharacteristicOptions>;
};

export type CompendiumTrait = {
  __typename?: 'CompendiumTrait';
  description: Array<Scalars['String']['output']>;
  languageChoiceCount?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
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
  featureChoices?: InputMaybe<Array<FeatureChoiceInput>>;
  initiative: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  /**
   * Generic proficiency picks for every class row: STARTING groups on the
   * starting class and MULTICLASS groups on secondary classes. Includes SKILL
   * and named (armor/weapon/tool/other) groups. Identity is `(classId, choiceGroup)`;
   * values are proficiency identities (`srdIndex ?? id`). The server validates
   * each group independently and derives persisted skill/trait grants from these
   * picks plus fixed class and background grants — `skillProficiencies` is not
   * choice provenance.
   */
  proficiencyChoices?: InputMaybe<Array<ProficiencyChoiceSelectionInput>>;
  race: Scalars['String']['input'];
  /**
   * Compatibility field. Creation derives persisted skill proficiencies from
   * validated `proficiencyChoices` plus fixed class/background grants. Client
   * values are not used as choice-group provenance.
   */
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

export type CustomSubclass = {
  __typename?: 'CustomSubclass';
  canChangeClass: Scalars['Boolean']['output'];
  cannotChangeClassReason?: Maybe<Scalars['String']['output']>;
  characterUsageCount: Scalars['Int']['output'];
  classId: Scalars['String']['output'];
  className: Scalars['String']['output'];
  description: Array<Scalars['String']['output']>;
  features: Array<AvailableSubclassFeature>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  selectionLevel: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type CustomSubclassInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  selectionLevel: Scalars['Int']['input'];
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

export type FeatureChoiceInput = {
  chosenChildSrdIndex: Scalars['String']['input'];
  parentSrdIndex: Scalars['String']['input'];
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

export type ManagedCustomClassFeatureInput = {
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  level: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type ManagedCustomClassInput = {
  addSpellcastingAbility: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  emoji: Scalars['String']['input'];
  equipment: Array<ClassEquipmentDefinitionInput>;
  features: Array<ManagedCustomClassFeatureInput>;
  hitDie: Scalars['Int']['input'];
  multiclassPrerequisites: Array<ClassMulticlassPrerequisiteInput>;
  name: Scalars['String']['input'];
  primaryAbilityIndexes: Array<Scalars['String']['input']>;
  proficiencies: Array<ClassProficiencyInput>;
  progression: Array<ClassLevelProgressionInput>;
  savingThrowIndexes: Array<Scalars['String']['input']>;
  spellIds: Array<Scalars['ID']['input']>;
  spellcastingAbility?: InputMaybe<Scalars['String']['input']>;
  spellcastingMode: Scalars['String']['input'];
};

export type ManagedCustomSubclassFeatureInput = {
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  level: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type ManagedCustomSubclassInput = {
  classId: Scalars['String']['input'];
  description: Scalars['String']['input'];
  features?: InputMaybe<Array<ManagedCustomSubclassFeatureInput>>;
  name: Scalars['String']['input'];
  selectionLevel: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveCustomClass: Scalars['Boolean']['output'];
  archiveCustomSubclass: Scalars['Boolean']['output'];
  createCharacter: Character;
  createCustomClass: ClassDetails;
  createCustomSubclass: CustomSubclass;
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
  updateCustomClass: ClassDetails;
  updateCustomSubclass: CustomSubclass;
  updateDeathSaves: CharacterStats;
  updateHitDice: CharacterStats;
  updateInventoryItem: InventoryItem;
  updateSavingThrowProficiencies: CharacterStats;
  updateSkillProficiencies: CharacterStats;
};


export type MutationArchiveCustomClassArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveCustomSubclassArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateCharacterArgs = {
  input: CreateCharacterInput;
};


export type MutationCreateCustomClassArgs = {
  input: ManagedCustomClassInput;
};


export type MutationCreateCustomSubclassArgs = {
  input: ManagedCustomSubclassInput;
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


export type MutationUpdateCustomClassArgs = {
  id: Scalars['ID']['input'];
  input: ManagedCustomClassInput;
};


export type MutationUpdateCustomSubclassArgs = {
  id: Scalars['ID']['input'];
  input: ManagedCustomSubclassInput;
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

export type ProficiencyChoiceSelectionInput = {
  choiceGroup: Scalars['Int']['input'];
  /**
   * Class selection value (SRD `srdIndex` or owned custom class id), matching
   * `CreateCharacterClassInput.classId`. Choice groups are unique per class.
   */
  classId: Scalars['String']['input'];
  values: Array<Scalars['String']['input']>;
};

export enum ProficiencyLevel {
  Expert = 'expert',
  None = 'none',
  Proficient = 'proficient'
}

export type ProficiencyRef = {
  __typename?: 'ProficiencyRef';
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  attachedClassDetails: Array<ClassDetails>;
  availableBackgrounds: Array<AvailableBackground>;
  availableClasses: Array<AvailableClass>;
  availableSubclasses: Array<AvailableSubclass>;
  character?: Maybe<Character>;
  classDetails?: Maybe<ClassDetails>;
  compendiumBackgrounds: Array<CompendiumBackground>;
  compendiumCounts: CompendiumCounts;
  compendiumFeats: Array<CompendiumFeat>;
  compendiumLanguages: Array<CompendiumLanguage>;
  compendiumRaces: Array<CompendiumRace>;
  compendiumSubclasses: Array<CompendiumSubclass>;
  compendiumSubraces: Array<CompendiumSubrace>;
  currentUserCharacters: Array<Character>;
  customClasses: Array<AvailableClass>;
  customSubclasses: Array<CustomSubclass>;
  hasCurrentUserCharacters: Scalars['Boolean']['output'];
  proficiencies: Array<ProficiencyRef>;
  spell?: Maybe<Spell>;
  spells: Array<Spell>;
};


export type QueryAttachedClassDetailsArgs = {
  values: Array<Scalars['String']['input']>;
};


export type QueryAvailableSubclassesArgs = {
  classIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryCharacterArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassDetailsArgs = {
  value: Scalars['String']['input'];
};


export type QueryCustomSubclassesArgs = {
  classIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryProficienciesArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
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
  /**
   * MULTICLASS proficiency choice provenance for classes newly added in this
   * save. Includes SKILL and named (armor/weapon/tool/other) groups. Required
   * when the save introduces new class rows that grant MULTICLASS choice groups;
   * must be omitted or empty when no class is newly added so ordinary manual
   * trait/skill edits stay unconstrained. Option values use `srdIndex ?? id`.
   * Identity is `(classId, choiceGroup)`.
   */
  proficiencyChoices?: InputMaybe<Array<ProficiencyChoiceSelectionInput>>;
  skillProficiencies: SkillProficienciesInput;
  speed: Scalars['Int']['input'];
  spellbook: Array<SaveCharacterSheetSpellInput>;
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

export type SaveCharacterSheetSpellInput = {
  prepared: Scalars['Boolean']['input'];
  spellId: Scalars['ID']['input'];
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

export type CompendiumBackgroundsQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumBackgroundsQuery = { __typename?: 'Query', compendiumBackgrounds: Array<{ __typename?: 'CompendiumBackground', id: string, value: string, srdIndex?: string | null, name: string, isCustom: boolean, sourceBook?: string | null, featureName?: string | null, featureDescription: Array<string>, languageChoiceCount: number, characterUsageCount: number, proficiencies: Array<{ __typename?: 'CompendiumProficiency', value: string, name: string, type: string, isCustom: boolean }>, languages: Array<{ __typename?: 'CompendiumReference', value: string, name: string }>, startingEquipment: Array<{ __typename?: 'CompendiumEquipment', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, suggestedCharacteristics?: { __typename?: 'CompendiumSuggestedCharacteristics', personalityTraits?: { __typename?: 'CompendiumCharacteristicOptions', choose: number, options: Array<string> } | null, ideals?: { __typename?: 'CompendiumCharacteristicOptions', choose: number, options: Array<string> } | null, bonds?: { __typename?: 'CompendiumCharacteristicOptions', choose: number, options: Array<string> } | null, flaws?: { __typename?: 'CompendiumCharacteristicOptions', choose: number, options: Array<string> } | null } | null }> };

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


export type AvailableSubclassesQuery = { __typename?: 'Query', availableSubclasses: Array<{ __typename?: 'AvailableSubclass', id: string, value: string, srdIndex?: string | null, classId: string, className: string, name: string, selectionLevel: number, description: Array<string>, isCustom: boolean, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> }> };

export type AvailableBackgroundsQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailableBackgroundsQuery = { __typename?: 'Query', availableBackgrounds: Array<{ __typename?: 'AvailableBackground', id: string, value: string, srdIndex?: string | null, name: string, description: string, featureName?: string | null, isCustom: boolean }> };

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

export type ClassSummaryFieldsFragment = { __typename?: 'AvailableClass', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, isCustom: boolean, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }> };

export type ClassDetailsFieldsFragment = { __typename?: 'ClassDetails', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, addSpellcastingAbility: boolean, isCustom: boolean, archived: boolean, sourceBook?: string | null, characterUsageCount: number, mechanicsLocked: boolean, mechanicsLockedReason?: string | null, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }>, proficiencies: Array<{ __typename?: 'ClassProficiency', value: string, name: string, type: string, grant: string, choiceGroup?: number | null, choiceCount?: number | null }>, equipment: Array<{ __typename?: 'ClassEquipmentDefinition', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, progression: Array<{ __typename?: 'ClassLevelProgression', level: number, abilityScoreImprovement: boolean, spellSlots: Array<number>, cantripsKnown?: number | null, spellsKnown?: number | null, preparedSpellCount?: number | null, displayValues: Array<{ __typename?: 'ClassDisplayValue', key: string, value: string }> }>, features: Array<{ __typename?: 'ClassFeature', id: string, name: string, description: string, level: number }>, spells: Array<{ __typename?: 'ClassSpell', id: string, name: string, level: number }> };

export type AvailableClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailableClassesQuery = { __typename?: 'Query', availableClasses: Array<{ __typename?: 'AvailableClass', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, isCustom: boolean, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }> }> };

export type ClassDetailsQueryVariables = Exact<{
  value: Scalars['String']['input'];
}>;


export type ClassDetailsQuery = { __typename?: 'Query', classDetails?: { __typename?: 'ClassDetails', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, addSpellcastingAbility: boolean, isCustom: boolean, archived: boolean, sourceBook?: string | null, characterUsageCount: number, mechanicsLocked: boolean, mechanicsLockedReason?: string | null, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }>, proficiencies: Array<{ __typename?: 'ClassProficiency', value: string, name: string, type: string, grant: string, choiceGroup?: number | null, choiceCount?: number | null }>, equipment: Array<{ __typename?: 'ClassEquipmentDefinition', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, progression: Array<{ __typename?: 'ClassLevelProgression', level: number, abilityScoreImprovement: boolean, spellSlots: Array<number>, cantripsKnown?: number | null, spellsKnown?: number | null, preparedSpellCount?: number | null, displayValues: Array<{ __typename?: 'ClassDisplayValue', key: string, value: string }> }>, features: Array<{ __typename?: 'ClassFeature', id: string, name: string, description: string, level: number }>, spells: Array<{ __typename?: 'ClassSpell', id: string, name: string, level: number }> } | null };

export type CustomClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomClassesQuery = { __typename?: 'Query', customClasses: Array<{ __typename?: 'AvailableClass', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, isCustom: boolean, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }> }> };

export type AttachedClassDetailsQueryVariables = Exact<{
  values: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AttachedClassDetailsQuery = { __typename?: 'Query', attachedClassDetails: Array<{ __typename?: 'ClassDetails', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, addSpellcastingAbility: boolean, isCustom: boolean, archived: boolean, sourceBook?: string | null, characterUsageCount: number, mechanicsLocked: boolean, mechanicsLockedReason?: string | null, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }>, proficiencies: Array<{ __typename?: 'ClassProficiency', value: string, name: string, type: string, grant: string, choiceGroup?: number | null, choiceCount?: number | null }>, equipment: Array<{ __typename?: 'ClassEquipmentDefinition', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, progression: Array<{ __typename?: 'ClassLevelProgression', level: number, abilityScoreImprovement: boolean, spellSlots: Array<number>, cantripsKnown?: number | null, spellsKnown?: number | null, preparedSpellCount?: number | null, displayValues: Array<{ __typename?: 'ClassDisplayValue', key: string, value: string }> }>, features: Array<{ __typename?: 'ClassFeature', id: string, name: string, description: string, level: number }>, spells: Array<{ __typename?: 'ClassSpell', id: string, name: string, level: number }> }> };

export type CreateCustomClassMutationVariables = Exact<{
  input: ManagedCustomClassInput;
}>;


export type CreateCustomClassMutation = { __typename?: 'Mutation', createCustomClass: { __typename?: 'ClassDetails', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, addSpellcastingAbility: boolean, isCustom: boolean, archived: boolean, sourceBook?: string | null, characterUsageCount: number, mechanicsLocked: boolean, mechanicsLockedReason?: string | null, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }>, proficiencies: Array<{ __typename?: 'ClassProficiency', value: string, name: string, type: string, grant: string, choiceGroup?: number | null, choiceCount?: number | null }>, equipment: Array<{ __typename?: 'ClassEquipmentDefinition', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, progression: Array<{ __typename?: 'ClassLevelProgression', level: number, abilityScoreImprovement: boolean, spellSlots: Array<number>, cantripsKnown?: number | null, spellsKnown?: number | null, preparedSpellCount?: number | null, displayValues: Array<{ __typename?: 'ClassDisplayValue', key: string, value: string }> }>, features: Array<{ __typename?: 'ClassFeature', id: string, name: string, description: string, level: number }>, spells: Array<{ __typename?: 'ClassSpell', id: string, name: string, level: number }> } };

export type UpdateCustomClassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ManagedCustomClassInput;
}>;


export type UpdateCustomClassMutation = { __typename?: 'Mutation', updateCustomClass: { __typename?: 'ClassDetails', id: string, value: string, srdIndex?: string | null, name: string, emoji: string, description: Array<string>, hitDie: number, primaryAbilityIndexes: Array<string>, savingThrowIndexes: Array<string>, spellcastingMode: string, spellcastingAbility?: string | null, addSpellcastingAbility: boolean, isCustom: boolean, archived: boolean, sourceBook?: string | null, characterUsageCount: number, mechanicsLocked: boolean, mechanicsLockedReason?: string | null, multiclassPrerequisites: Array<{ __typename?: 'ClassMulticlassPrerequisite', abilityIndex: string, minimum: number, group: number }>, proficiencies: Array<{ __typename?: 'ClassProficiency', value: string, name: string, type: string, grant: string, choiceGroup?: number | null, choiceCount?: number | null }>, equipment: Array<{ __typename?: 'ClassEquipmentDefinition', name: string, quantity: number, choiceGroup?: number | null, choiceCount?: number | null }>, progression: Array<{ __typename?: 'ClassLevelProgression', level: number, abilityScoreImprovement: boolean, spellSlots: Array<number>, cantripsKnown?: number | null, spellsKnown?: number | null, preparedSpellCount?: number | null, displayValues: Array<{ __typename?: 'ClassDisplayValue', key: string, value: string }> }>, features: Array<{ __typename?: 'ClassFeature', id: string, name: string, description: string, level: number }>, spells: Array<{ __typename?: 'ClassSpell', id: string, name: string, level: number }> } };

export type ProficienciesQueryVariables = Exact<{
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProficienciesQuery = { __typename?: 'Query', proficiencies: Array<{ __typename?: 'ProficiencyRef', value: string, name: string, type: string, isCustom: boolean }> };

export type ArchiveCustomClassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveCustomClassMutation = { __typename?: 'Mutation', archiveCustomClass: boolean };

export type CompendiumCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumCountsQuery = { __typename?: 'Query', compendiumCounts: { __typename?: 'CompendiumCounts', srdClassCount: number, customClassCount: number, srdSubclassCount: number, customSubclassCount: number, srdRaceCount: number, customRaceCount: number, srdSubraceCount: number, customSubraceCount: number, srdBackgroundCount: number, customBackgroundCount: number, srdFeatCount: number, customFeatCount: number, srdLanguageCount: number, customLanguageCount: number, spellCount: number } };

export type CustomSubclassManagerFieldsFragment = { __typename?: 'CustomSubclass', id: string, value: string, classId: string, className: string, name: string, selectionLevel: number, description: Array<string>, characterUsageCount: number, canChangeClass: boolean, cannotChangeClassReason?: string | null, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> };

export type CustomSubclassesQueryVariables = Exact<{
  classIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CustomSubclassesQuery = { __typename?: 'Query', customSubclasses: Array<{ __typename?: 'CustomSubclass', id: string, value: string, classId: string, className: string, name: string, selectionLevel: number, description: Array<string>, characterUsageCount: number, canChangeClass: boolean, cannotChangeClassReason?: string | null, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> }> };

export type CreateCustomSubclassMutationVariables = Exact<{
  input: ManagedCustomSubclassInput;
}>;


export type CreateCustomSubclassMutation = { __typename?: 'Mutation', createCustomSubclass: { __typename?: 'CustomSubclass', id: string, value: string, classId: string, className: string, name: string, selectionLevel: number, description: Array<string>, characterUsageCount: number, canChangeClass: boolean, cannotChangeClassReason?: string | null, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> } };

export type UpdateCustomSubclassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ManagedCustomSubclassInput;
}>;


export type UpdateCustomSubclassMutation = { __typename?: 'Mutation', updateCustomSubclass: { __typename?: 'CustomSubclass', id: string, value: string, classId: string, className: string, name: string, selectionLevel: number, description: Array<string>, characterUsageCount: number, canChangeClass: boolean, cannotChangeClassReason?: string | null, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> } };

export type ArchiveCustomSubclassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveCustomSubclassMutation = { __typename?: 'Mutation', archiveCustomSubclass: boolean };

export type CompendiumFeatsQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumFeatsQuery = { __typename?: 'Query', compendiumFeats: Array<{ __typename?: 'CompendiumFeat', id: string, value: string, srdIndex?: string | null, name: string, isCustom: boolean, sourceBook?: string | null, description: Array<string>, prerequisiteSummary?: string | null, characterUsageCount: number, prerequisites: Array<{ __typename?: 'CompendiumFeatPrerequisite', abilityIndex: string, abilityName: string, minimumScore: number }> }> };

export type CompendiumLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumLanguagesQuery = { __typename?: 'Query', compendiumLanguages: Array<{ __typename?: 'CompendiumLanguage', id: string, value: string, srdIndex?: string | null, name: string, isCustom: boolean, sourceBook?: string | null, type?: string | null, script?: string | null, typicalSpeakers: Array<string>, description?: string | null, characterUsageCount: number, grantingRaces: Array<{ __typename?: 'CompendiumReference', value: string, name: string }>, grantingBackgrounds: Array<{ __typename?: 'CompendiumReference', value: string, name: string }>, grantingTraits: Array<{ __typename?: 'CompendiumReference', value: string, name: string }>, sameScriptLanguages: Array<{ __typename?: 'CompendiumReference', value: string, name: string }> }> };

export type CompendiumRacesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumRacesQuery = { __typename?: 'Query', compendiumRaces: Array<{ __typename?: 'CompendiumRace', id: string, value: string, srdIndex?: string | null, name: string, isCustom: boolean, sourceBook?: string | null, speed?: number | null, size?: string | null, sizeDescription?: string | null, age?: string | null, alignment?: string | null, languageDescription?: string | null, languageChoiceCount: number, abilitySummary?: string | null, characterUsageCount: number, abilityBonuses: Array<{ __typename?: 'CompendiumAbilityBonus', abilityIndex: string, abilityName: string, bonus: number }>, traits: Array<{ __typename?: 'CompendiumTrait', value: string, name: string, description: Array<string>, languageChoiceCount?: number | null }>, languages: Array<{ __typename?: 'CompendiumReference', value: string, name: string }>, subraces: Array<{ __typename?: 'CompendiumSubraceSummary', value: string, name: string, abilitySummary?: string | null, traitCount: number, abilityBonuses: Array<{ __typename?: 'CompendiumAbilityBonus', abilityIndex: string, abilityName: string, bonus: number }> }> }> };

export type SpellListFieldsFragment = { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean };

export type CharacterSpellbookEntryFieldsFragment = { __typename?: 'CharacterSpell', prepared: boolean, spell: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, castingTime: string, range?: string | null, concentration: boolean, ritual: boolean } };

export type CompendiumSubclassesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumSubclassesQuery = { __typename?: 'Query', compendiumSubclasses: Array<{ __typename?: 'CompendiumSubclass', id: string, value: string, srdIndex?: string | null, name: string, description: Array<string>, isCustom: boolean, sourceBook?: string | null, classId: string, className: string, selectionLevel: number, characterUsageCount: number, canChangeClass: boolean, cannotChangeClassReason?: string | null, features: Array<{ __typename?: 'AvailableSubclassFeature', id: string, name: string, description: string, level: number }> }> };

export type CompendiumSubracesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompendiumSubracesQuery = { __typename?: 'Query', compendiumSubraces: Array<{ __typename?: 'CompendiumSubrace', id: string, value: string, srdIndex?: string | null, name: string, description?: string | null, isCustom: boolean, sourceBook?: string | null, abilitySummary?: string | null, characterUsageCount: number, parentRace: { __typename?: 'CompendiumParentRace', value: string, name: string, speed?: number | null, size?: string | null, languageDescription?: string | null, languageChoiceCount: number, abilitySummary?: string | null, abilityBonuses: Array<{ __typename?: 'CompendiumAbilityBonus', abilityIndex: string, abilityName: string, bonus: number }>, traits: Array<{ __typename?: 'CompendiumTrait', value: string, name: string, description: Array<string>, languageChoiceCount?: number | null }>, languages: Array<{ __typename?: 'CompendiumReference', value: string, name: string }> }, abilityBonuses: Array<{ __typename?: 'CompendiumAbilityBonus', abilityIndex: string, abilityName: string, bonus: number }>, traits: Array<{ __typename?: 'CompendiumTrait', value: string, name: string, description: Array<string>, languageChoiceCount?: number | null }> }> };
