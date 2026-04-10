import type { GraphQLResolveInfo } from 'graphql';
import type { Character as PrismaCharacter, CharacterStats as PrismaCharacterStats, CharacterSpell as PrismaCharacterSpell } from '@prisma/client';
import type { Context } from '../index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  skillProficiencies: SkillProficienciesInput;
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AbilityScores: ResolverTypeWrapper<AbilityScores>;
  AbilityScoresInput: AbilityScoresInput;
  AvailableSubclass: ResolverTypeWrapper<AvailableSubclass>;
  AvailableSubclassFeature: ResolverTypeWrapper<AvailableSubclassFeature>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Character: ResolverTypeWrapper<PrismaCharacter>;
  CharacterClass: ResolverTypeWrapper<CharacterClass>;
  CharacterFeature: ResolverTypeWrapper<CharacterFeature>;
  CharacterSpell: ResolverTypeWrapper<PrismaCharacterSpell>;
  CharacterStats: ResolverTypeWrapper<PrismaCharacterStats>;
  CreateCharacterClassInput: CreateCharacterClassInput;
  CreateCharacterInput: CreateCharacterInput;
  Currency: ResolverTypeWrapper<Currency>;
  CurrencyInput: CurrencyInput;
  CustomSubclassInput: CustomSubclassInput;
  DeathSaves: ResolverTypeWrapper<DeathSaves>;
  DeathSavesInput: DeathSavesInput;
  FeatureInput: FeatureInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  HP: ResolverTypeWrapper<Hp>;
  HPInput: HpInput;
  HitDicePool: ResolverTypeWrapper<HitDicePool>;
  HitDicePoolInput: HitDicePoolInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InventoryItem: ResolverTypeWrapper<InventoryItem>;
  InventoryItemInput: InventoryItemInput;
  Mutation: ResolverTypeWrapper<{}>;
  ProficiencyLevel: ProficiencyLevel;
  Query: ResolverTypeWrapper<{}>;
  SaveCharacterSheetClassInput: SaveCharacterSheetClassInput;
  SaveCharacterSheetFeatureInput: SaveCharacterSheetFeatureInput;
  SaveCharacterSheetInput: SaveCharacterSheetInput;
  SaveCharacterSheetInventoryItemInput: SaveCharacterSheetInventoryItemInput;
  SaveCharacterSheetWeaponInput: SaveCharacterSheetWeaponInput;
  SaveCustomSubclassFeatureInput: SaveCustomSubclassFeatureInput;
  SavingThrowProficienciesInput: SavingThrowProficienciesInput;
  SkillProficiencies: ResolverTypeWrapper<SkillProficiencies>;
  SkillProficienciesInput: SkillProficienciesInput;
  Spell: ResolverTypeWrapper<Spell>;
  SpellFilter: SpellFilter;
  SpellPagination: SpellPagination;
  SpellSlot: ResolverTypeWrapper<SpellSlot>;
  SpellSlotKind: SpellSlotKind;
  SpellcastingProfile: ResolverTypeWrapper<SpellcastingProfile>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Traits: ResolverTypeWrapper<Traits>;
  TraitsInput: TraitsInput;
  UpdateCharacterInput: UpdateCharacterInput;
  Weapon: ResolverTypeWrapper<Weapon>;
  WeaponInput: WeaponInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AbilityScores: AbilityScores;
  AbilityScoresInput: AbilityScoresInput;
  AvailableSubclass: AvailableSubclass;
  AvailableSubclassFeature: AvailableSubclassFeature;
  Boolean: Scalars['Boolean']['output'];
  Character: PrismaCharacter;
  CharacterClass: CharacterClass;
  CharacterFeature: CharacterFeature;
  CharacterSpell: PrismaCharacterSpell;
  CharacterStats: PrismaCharacterStats;
  CreateCharacterClassInput: CreateCharacterClassInput;
  CreateCharacterInput: CreateCharacterInput;
  Currency: Currency;
  CurrencyInput: CurrencyInput;
  CustomSubclassInput: CustomSubclassInput;
  DeathSaves: DeathSaves;
  DeathSavesInput: DeathSavesInput;
  FeatureInput: FeatureInput;
  Float: Scalars['Float']['output'];
  HP: Hp;
  HPInput: HpInput;
  HitDicePool: HitDicePool;
  HitDicePoolInput: HitDicePoolInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InventoryItem: InventoryItem;
  InventoryItemInput: InventoryItemInput;
  Mutation: {};
  Query: {};
  SaveCharacterSheetClassInput: SaveCharacterSheetClassInput;
  SaveCharacterSheetFeatureInput: SaveCharacterSheetFeatureInput;
  SaveCharacterSheetInput: SaveCharacterSheetInput;
  SaveCharacterSheetInventoryItemInput: SaveCharacterSheetInventoryItemInput;
  SaveCharacterSheetWeaponInput: SaveCharacterSheetWeaponInput;
  SaveCustomSubclassFeatureInput: SaveCustomSubclassFeatureInput;
  SavingThrowProficienciesInput: SavingThrowProficienciesInput;
  SkillProficiencies: SkillProficiencies;
  SkillProficienciesInput: SkillProficienciesInput;
  Spell: Spell;
  SpellFilter: SpellFilter;
  SpellPagination: SpellPagination;
  SpellSlot: SpellSlot;
  SpellcastingProfile: SpellcastingProfile;
  String: Scalars['String']['output'];
  Traits: Traits;
  TraitsInput: TraitsInput;
  UpdateCharacterInput: UpdateCharacterInput;
  Weapon: Weapon;
  WeaponInput: WeaponInput;
};

export type AbilityScoresResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AbilityScores'] = ResolversParentTypes['AbilityScores']> = {
  charisma?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  constitution?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dexterity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  intelligence?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  strength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  wisdom?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AvailableSubclassResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AvailableSubclass'] = ResolversParentTypes['AvailableSubclass']> = {
  classId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  className?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Array<ResolversTypes['AvailableSubclassFeature']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCustom?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  srdIndex?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AvailableSubclassFeatureResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AvailableSubclassFeature'] = ResolversParentTypes['AvailableSubclassFeature']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CharacterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Character'] = ResolversParentTypes['Character']> = {
  ac?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  alignment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  background?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  classes?: Resolver<Array<ResolversTypes['CharacterClass']>, ParentType, ContextType>;
  conditions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Array<ResolversTypes['CharacterFeature']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  initiative?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inspiration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  inventory?: Resolver<Array<ResolversTypes['InventoryItem']>, ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  proficiencyBonus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  race?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  speed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spellSlots?: Resolver<Array<ResolversTypes['SpellSlot']>, ParentType, ContextType>;
  spellbook?: Resolver<Array<ResolversTypes['CharacterSpell']>, ParentType, ContextType>;
  spellcastingProfiles?: Resolver<Array<ResolversTypes['SpellcastingProfile']>, ParentType, ContextType>;
  stats?: Resolver<Maybe<ResolversTypes['CharacterStats']>, ParentType, ContextType>;
  weapons?: Resolver<Array<ResolversTypes['Weapon']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CharacterClassResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CharacterClass'] = ResolversParentTypes['CharacterClass']> = {
  classId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  className?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isStartingClass?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subclassId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subclassName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CharacterFeatureResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CharacterFeature'] = ResolversParentTypes['CharacterFeature']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recharge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usesMax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  usesRemaining?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CharacterSpellResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CharacterSpell'] = ResolversParentTypes['CharacterSpell']> = {
  prepared?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  spell?: Resolver<ResolversTypes['Spell'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CharacterStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CharacterStats'] = ResolversParentTypes['CharacterStats']> = {
  abilityScores?: Resolver<ResolversTypes['AbilityScores'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  deathSaves?: Resolver<ResolversTypes['DeathSaves'], ParentType, ContextType>;
  hitDicePools?: Resolver<Array<ResolversTypes['HitDicePool']>, ParentType, ContextType>;
  hp?: Resolver<ResolversTypes['HP'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  savingThrowProficiencies?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  skillProficiencies?: Resolver<ResolversTypes['SkillProficiencies'], ParentType, ContextType>;
  traits?: Resolver<ResolversTypes['Traits'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrencyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Currency'] = ResolversParentTypes['Currency']> = {
  cp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ep?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeathSavesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeathSaves'] = ResolversParentTypes['DeathSaves']> = {
  failures?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  successes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HpResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HP'] = ResolversParentTypes['HP']> = {
  current?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  temp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HitDicePoolResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HitDicePool'] = ResolversParentTypes['HitDicePool']> = {
  classId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  className?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  die?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  remaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InventoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InventoryItem'] = ResolversParentTypes['InventoryItem']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  equipped?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  magical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createCharacter?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationCreateCharacterArgs, 'input'>>;
  deleteCharacter?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCharacterArgs, 'id'>>;
  forgetSpell?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationForgetSpellArgs, 'characterId' | 'spellId'>>;
  learnSpell?: Resolver<ResolversTypes['CharacterSpell'], ParentType, ContextType, RequireFields<MutationLearnSpellArgs, 'characterId' | 'spellId'>>;
  longRest?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationLongRestArgs, 'characterId'>>;
  prepareSpell?: Resolver<ResolversTypes['CharacterSpell'], ParentType, ContextType, RequireFields<MutationPrepareSpellArgs, 'characterId' | 'spellId'>>;
  saveCharacterSheet?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationSaveCharacterSheetArgs, 'characterId' | 'input'>>;
  shortRest?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationShortRestArgs, 'characterId'>>;
  spendHitDie?: Resolver<ResolversTypes['CharacterStats'], ParentType, ContextType, RequireFields<MutationSpendHitDieArgs, 'amount' | 'characterId' | 'classId'>>;
  toggleInspiration?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationToggleInspirationArgs, 'characterId'>>;
  toggleSpellSlot?: Resolver<ResolversTypes['SpellSlot'], ParentType, ContextType, RequireFields<MutationToggleSpellSlotArgs, 'characterId' | 'kind' | 'level'>>;
  unprepareSpell?: Resolver<ResolversTypes['CharacterSpell'], ParentType, ContextType, RequireFields<MutationUnprepareSpellArgs, 'characterId' | 'spellId'>>;
  updateCharacter?: Resolver<ResolversTypes['Character'], ParentType, ContextType, RequireFields<MutationUpdateCharacterArgs, 'id' | 'input'>>;
  updateDeathSaves?: Resolver<ResolversTypes['CharacterStats'], ParentType, ContextType, RequireFields<MutationUpdateDeathSavesArgs, 'characterId' | 'input'>>;
  updateHitDice?: Resolver<ResolversTypes['CharacterStats'], ParentType, ContextType, RequireFields<MutationUpdateHitDiceArgs, 'characterId' | 'input'>>;
  updateInventoryItem?: Resolver<ResolversTypes['InventoryItem'], ParentType, ContextType, RequireFields<MutationUpdateInventoryItemArgs, 'characterId' | 'input' | 'itemId'>>;
  updateSavingThrowProficiencies?: Resolver<ResolversTypes['CharacterStats'], ParentType, ContextType, RequireFields<MutationUpdateSavingThrowProficienciesArgs, 'characterId' | 'input'>>;
  updateSkillProficiencies?: Resolver<ResolversTypes['CharacterStats'], ParentType, ContextType, RequireFields<MutationUpdateSkillProficienciesArgs, 'characterId' | 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  availableSubclasses?: Resolver<Array<ResolversTypes['AvailableSubclass']>, ParentType, ContextType, Partial<QueryAvailableSubclassesArgs>>;
  character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType, RequireFields<QueryCharacterArgs, 'id'>>;
  currentUserCharacters?: Resolver<Array<ResolversTypes['Character']>, ParentType, ContextType>;
  hasCurrentUserCharacters?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  spell?: Resolver<Maybe<ResolversTypes['Spell']>, ParentType, ContextType, RequireFields<QuerySpellArgs, 'id'>>;
  spells?: Resolver<Array<ResolversTypes['Spell']>, ParentType, ContextType, Partial<QuerySpellsArgs>>;
};

export type SkillProficienciesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SkillProficiencies'] = ResolversParentTypes['SkillProficiencies']> = {
  acrobatics?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  animalHandling?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  arcana?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  athletics?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  deception?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  history?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  insight?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  intimidation?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  investigation?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  medicine?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  nature?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  perception?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  performance?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  persuasion?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  religion?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  sleightOfHand?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  stealth?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  survival?: Resolver<ResolversTypes['ProficiencyLevel'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpellResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Spell'] = ResolversParentTypes['Spell']> = {
  castingTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  classIndexes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  components?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  concentration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  higherLevel?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  range?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ritual?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  schoolIndex?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sourceBook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpellSlotResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SpellSlot'] = ResolversParentTypes['SpellSlot']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['SpellSlotKind'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  used?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpellcastingProfileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SpellcastingProfile'] = ResolversParentTypes['SpellcastingProfile']> = {
  classId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  classLevel?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  className?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slotKind?: Resolver<ResolversTypes['SpellSlotKind'], ParentType, ContextType>;
  spellAttackBonus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spellSaveDC?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  spellcastingAbility?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subclassId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subclassName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TraitsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Traits'] = ResolversParentTypes['Traits']> = {
  armorProficiencies?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bonds?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  flaws?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ideals?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  languages?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  personality?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toolProficiencies?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  weaponProficiencies?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WeaponResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Weapon'] = ResolversParentTypes['Weapon']> = {
  attackBonus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  damage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AbilityScores?: AbilityScoresResolvers<ContextType>;
  AvailableSubclass?: AvailableSubclassResolvers<ContextType>;
  AvailableSubclassFeature?: AvailableSubclassFeatureResolvers<ContextType>;
  Character?: CharacterResolvers<ContextType>;
  CharacterClass?: CharacterClassResolvers<ContextType>;
  CharacterFeature?: CharacterFeatureResolvers<ContextType>;
  CharacterSpell?: CharacterSpellResolvers<ContextType>;
  CharacterStats?: CharacterStatsResolvers<ContextType>;
  Currency?: CurrencyResolvers<ContextType>;
  DeathSaves?: DeathSavesResolvers<ContextType>;
  HP?: HpResolvers<ContextType>;
  HitDicePool?: HitDicePoolResolvers<ContextType>;
  InventoryItem?: InventoryItemResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SkillProficiencies?: SkillProficienciesResolvers<ContextType>;
  Spell?: SpellResolvers<ContextType>;
  SpellSlot?: SpellSlotResolvers<ContextType>;
  SpellcastingProfile?: SpellcastingProfileResolvers<ContextType>;
  Traits?: TraitsResolvers<ContextType>;
  Weapon?: WeaponResolvers<ContextType>;
};

