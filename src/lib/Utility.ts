/**
 * Utility functions for the Oxxify Fan Control adapter.
 */
export class Utility {
    private static FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;

    /**
     * Parses a fan ID from a state identifier string.
     * @param strId The state identifier string.
     * @returns The 16-character hex fan ID if found, otherwise undefined.
     */
    public static ParseFanId(strId: string): string | undefined {
        const strFanIdRegex = "[0-9A-Fa-f]{16}";
        const match = strId.match(strFanIdRegex);

        if (match) {
            return match.toString();
        }

        return undefined;
    }

    /**
     * Removes invalid characters from a user input string by replacing them with underscores.
     * @param strUserInput The user input string.
     * @returns The sanitized string.
     */
    public static RemoveInvalidCharacters(strUserInput: string): string {
        if (strUserInput == null) return "_";
        return strUserInput.replace(Utility.FORBIDDEN_CHARS, "_");
    }
}
