import {
    displayLanguageType,
    hasRecordedScript,
    languageScriptMark,
    scriptLabel,
    speakerSummary,
} from '@/components/compendium/language-presentation';

describe('hasRecordedScript', () => {
    it('treats null, undefined, and blank scripts as unwritten', () => {
        expect(hasRecordedScript(null)).toBe(false);
        expect(hasRecordedScript(undefined)).toBe(false);
        expect(hasRecordedScript('   ')).toBe(false);
        expect(hasRecordedScript('Common')).toBe(true);
    });
});

describe('displayLanguageType', () => {
    it('title-cases a recorded type and names an unknown one', () => {
        expect(displayLanguageType('standard')).toBe('Standard');
        expect(displayLanguageType('EXOTIC')).toBe('Exotic');
        expect(displayLanguageType(null)).toBe('Unknown type');
        expect(displayLanguageType('')).toBe('Unknown type');
    });
});

describe('languageScriptMark', () => {
    it('uses two script letters, or an empty-set mark when unwritten', () => {
        expect(languageScriptMark('Dwarvish')).toBe('Dw');
        expect(languageScriptMark(null)).toBe('∅');
        expect(languageScriptMark('  ')).toBe('∅');
    });
});

describe('scriptLabel', () => {
    it('labels a recorded script and an unwritten one', () => {
        expect(scriptLabel('Elvish')).toBe('Elvish script');
        expect(scriptLabel(null)).toBe('Unwritten / unknown');
    });
});

describe('speakerSummary', () => {
    it('reads as a sentence for one or more speakers', () => {
        expect(speakerSummary(['Humans'])).toBe('Typically spoken by Humans.');
        expect(speakerSummary(['Dwarves', 'Gnomes'])).toBe('Typically spoken by Dwarves and Gnomes.');
    });

    it('falls back when no speakers are recorded', () => {
        expect(speakerSummary([])).toBe('No typical speakers are listed.');
    });
});
