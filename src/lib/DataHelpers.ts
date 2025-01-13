/**
 * A data helper class with static methods, which are necessary at several places.
 */
export class DataHelpers {
    /**
     * Parses the provided ioBroker StateValue to a number. This works either for provided numbers or strings.
     * A string is at first parsed as it is. If this does not work, the first space is used to split the string
     * and the first part is expected to be a number. In case no space is found, the first characters are parsed
     * to a number (any one until the first non-numeric char appers).
     *
     * @param value The ioBroker StateValue which is converted to a number.
     * @param log The reference to the ioBroker logger, to create messages.
     * @returns The parsed number or NaN in case it could not be parsed.
     */
    public static ParseInputNumber(value: ioBroker.StateValue, log: ioBroker.Logger | undefined): number {
        if (typeof value !== "number" && typeof value !== "string") {
            log?.warn(`The value is not from type number or string, but ${typeof value}`);
            return NaN;
        }

        let nValue = Number(value);

        if (typeof value === "string") {
            nValue = parseInt(value);

            // Give it a second try, if it was not parsable -> check for the first space as separating character
            if (isNaN(nValue)) {
                nValue = parseInt(String(value).substring(0, String(value).indexOf(" ")));
            }

            if (isNaN(nValue)) {
                log?.warn(`Unable to parse the number from the input value: ${value}`);
            }
        }

        return nValue;
    }
}
