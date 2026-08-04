import seedAbilityScores from './seeds/seedAbilityScores';
import seedRaces from './seeds/seedRaces';
import seedCustomSpells from './seeds/seedCustomSpells';
import seedSpells from './seeds/seedSpells';
import seedCharacter from './seeds/seedCharacter';
import seedCharacterReferenceData from './seeds/seedCharacterReferenceData';

await seedSpells();
await seedCustomSpells();
await seedAbilityScores();
await seedRaces();
await seedCharacterReferenceData();
await seedCharacter();
