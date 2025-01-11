/**
 * This is a TypeScript test file using chai and mocha
 */

import {} from "@iobroker/adapter-core";
import { expect } from "chai";
import { DataHelpers } from "./DataHelpers";

describe("DataHelpers => ParseInputNumber", () => {
    // ioBroker.StateValue can be "string | number | boolean | null"
    const runs = [
        { data: 2, result: 2 },
        { data: "2", result: 2 },
        { data: "2 - Ventilation", result: 2 },
        { data: "2 FooBar", result: 2 },
        { data: "2FooBar", result: 2 },

        { data: 3, result: 3 },
        { data: "3", result: 3 },
        { data: "3 - Unknown", result: 3 },
        { data: "3 FooBar", result: 3 },
        { data: "3FooBar", result: 3 },

        { data: 255, result: 255 },
        { data: "255", result: 255 },
        { data: "255 - Manual", result: 255 },
        { data: "255 FooBar", result: 255 },
        { data: "255FooBar", result: 255 },

        { data: "Foo", result: NaN },
        { data: "Foo Bar", result: NaN },
        { data: "Foo Bar 2", result: NaN },
        { data: "FooBar255", result: NaN },
        { data: "", result: NaN },
        { data: "undefined", result: NaN },

        { data: true, result: NaN },
        { data: false, result: NaN },
        { data: null, result: NaN },
    ];

    runs.forEach(function (currentRun) {
        it(`Input "${currentRun.data}" must return the number ${currentRun.result}`, function () {
            expect(DataHelpers.ParseInputNumber(currentRun.data, undefined)).to.be.deep.equal(currentRun.result);
        });
    });
});

// ... more test suites => describe
