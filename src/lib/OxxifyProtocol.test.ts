/**
 * This is a TypeScript test file using chai and mocha
 */

import {} from "@iobroker/adapter-core";
import { expect } from "chai";
import { ParsingStatus } from "./ModelData";
import { OxxifyProtocol } from "./OxxifyProtocol";
describe("OxxifyProtocol => HandlePartiallyRepeatedFrameData - Issue #91", () => {
    const runs = [
        {
            data: Buffer.from(
                "fdfd02103030333930303235344534363537303704313131310201010201720007008300060088004400b701fe04a3c0a80349ff03000101000601140b41542b43495053454e443d302c342c22312e312e312e31222c38300d0a7465737441542b5246504f5745523d35330d0a41542b43495053454e443d302c36312c22302e302e302e30222c343030310d0afdfd02103030333930303235344534363537303704313131310201010201720007008300",
                "hex",
            ),
            status: ParsingStatus.ChecksumError,
        },
    ];

    runs.forEach(function (currentRun) {
        it(`Input "${currentRun.data.toString("hex")}" must return the parsing status ${currentRun.status}`, function () {
            const oxxify: OxxifyProtocol = new OxxifyProtocol();

            const result = oxxify.ParseResponseData(currentRun.data);
            expect(result.status).to.be.equal(currentRun.status);
            expect(result.bFrameIsResponse).to.be.equal(false);
        });
    });
});
