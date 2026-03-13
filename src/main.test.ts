/**
 * This is a TypeScript test file using chai and mocha for the main adapter
 */

import { expect } from "chai";
import { Utility } from "./lib/Utility";

describe("OxxifyFanControl => Utility Methods", () => {
    beforeEach(() => {
        // Create a minimal adapter instance for testing
        // This is tricky because the constructor does a lot, so we'll test static-like methods
    });

    describe("ParseFanId", () => {
        it("should extract 16-character hex fan ID from state identifier", () => {
            const result = Utility.ParseFanId("devices.1234567890abcdef.fans.fanState");
            expect(result).to.equal("1234567890abcdef");
        });

        it("should return undefined for invalid state identifier", () => {
            const result = Utility.ParseFanId("invalid.state.id");
            expect(result).to.be.undefined;
        });

        it("should extract fan ID from middle of string", () => {
            const result = Utility.ParseFanId("prefix.abcdef1234567890.suffix");
            expect(result).to.equal("abcdef1234567890");
        });
    });

    describe("RemoveInvalidCharacters", () => {
        it("should replace invalid characters with underscore", () => {
            const result = Utility.RemoveInvalidCharacters("test@input#with$invalid%chars");
            expect(result).to.equal("test_input_with_invalid_chars");
        });

        it("should handle null input", () => {
            const result = Utility.RemoveInvalidCharacters(null as any);
            expect(result).to.equal("_");
        });

        it("should handle empty string", () => {
            const result = Utility.RemoveInvalidCharacters("");
            expect(result).to.equal("");
        });

        it("should not change valid characters", () => {
            const result = Utility.RemoveInvalidCharacters("validInput123._-");
            expect(result).to.equal("validInput123._-");
        });
    });
});
