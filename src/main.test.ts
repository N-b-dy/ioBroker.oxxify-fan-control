/**
 * This is a TypeScript test file using chai and mocha for the main adapter
 */

import { expect } from "chai";
import * as sinon from "sinon";
import { OxxifyFanControl } from "./main";

// Mock the adapter core to avoid dependencies
const mockAdapterCore = {
    Adapter: class {
        constructor(options: any) {
            this.options = options;
            this.on = sinon.stub();
        }
        options: any;
    },
};

// Replace the import temporarily for testing
// Since we can't easily mock the entire module, we'll test the methods directly
// by creating an instance and testing public methods

describe("OxxifyFanControl => Utility Methods", () => {
    let adapter: OxxifyFanControl;

    beforeEach(() => {
        // Create a minimal adapter instance for testing
        // This is tricky because the constructor does a lot, so we'll test static-like methods
    });

    describe("ParseFanId", () => {
        it("should extract 16-character hex fan ID from state identifier", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                public testParseFanId(strId: string): string | undefined {
                    return this.ParseFanId(strId);
                }
            })({ name: "test" });

            const result = testAdapter.testParseFanId("devices.1234567890abcdef.fans.fanState");
            expect(result).to.equal("1234567890abcdef");
        });

        it("should return undefined for invalid state identifier", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                public testParseFanId(strId: string): string | undefined {
                    return this.ParseFanId(strId);
                }
            })({ name: "test" });

            const result = testAdapter.testParseFanId("invalid.state.id");
            expect(result).to.be.undefined;
        });

        it("should extract fan ID from middle of string", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                public testParseFanId(strId: string): string | undefined {
                    return this.ParseFanId(strId);
                }
            })({ name: "test" });

            const result = testAdapter.testParseFanId("prefix.abcdef1234567890.suffix");
            expect(result).to.equal("abcdef1234567890");
        });
    });

    describe("RemoveInvalidCharacters", () => {
        it("should replace invalid characters with underscore", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;
                public testRemoveInvalidCharacters(strUserInput: string): string {
                    return this.RemoveInvalidCharacters(strUserInput);
                }
            })({ name: "test" });

            const result = testAdapter.testRemoveInvalidCharacters("test@input#with$invalid%chars");
            expect(result).to.equal("test_input_with_invalid_chars");
        });

        it("should handle null input", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;
                public testRemoveInvalidCharacters(strUserInput: string): string {
                    return this.RemoveInvalidCharacters(strUserInput);
                }
            })({ name: "test" });

            const result = testAdapter.testRemoveInvalidCharacters(null as any);
            expect(result).to.equal("_");
        });

        it("should handle empty string", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;
                public testRemoveInvalidCharacters(strUserInput: string): string {
                    return this.RemoveInvalidCharacters(strUserInput);
                }
            })({ name: "test" });

            const result = testAdapter.testRemoveInvalidCharacters("");
            expect(result).to.equal("");
        });

        it("should not change valid characters", () => {
            const testAdapter = new (class extends OxxifyFanControl {
                FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;
                public testRemoveInvalidCharacters(strUserInput: string): string {
                    return this.RemoveInvalidCharacters(strUserInput);
                }
            })({ name: "test" });

            const result = testAdapter.testRemoveInvalidCharacters("validInput123._-");
            expect(result).to.equal("validInput123._-");
        });
    });
});
