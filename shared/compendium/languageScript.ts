/**
 * A null or blank script means "unwritten / unknown", not a shared script group.
 * Shared by the browse resolver and the language Compendium screen so the two
 * cannot drift on what counts as a recorded script.
 */
export function hasRecordedScript(script: string | null | undefined): script is string {
    return script != null && script.trim() !== '';
}
