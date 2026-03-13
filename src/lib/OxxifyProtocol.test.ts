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

describe("OxxifyProtocol => CheckProtocol", () => {
    it("should return Ok for valid protocol buffer", () => {
        const oxxify: OxxifyProtocol = new OxxifyProtocol();

        // Create a minimal valid buffer: header + version + idSize + fanId(16) + passwordSize + password + function + checksum
        const buffer = Buffer.alloc(4 + 16 + 1 + 4 + 1 + 2); // header(4) + fanId(16) + pwdSize(1) + pwd(4) + func(1) + checksum(2)
        buffer[0] = 0xfd;
        buffer[1] = 0xfd;
        buffer[2] = 0x02;
        buffer[3] = 0x10; // header
        buffer.write("1234567890abcdef", 4); // fanId
        buffer[20] = 4; // password size
        buffer.write("test", 21); // password
        buffer[25] = 0x06; // response function
        // checksum calculation would be needed, but for this test we will calculate

        // Calculate checksum for subarray from index 2 to length-2
        const checksum = oxxify["CalculateChecksum"](buffer.subarray(2, buffer.length - 2));
        buffer[buffer.length - 2] = checksum & 0xff;
        buffer[buffer.length - 1] = checksum >> 8;

        const result = oxxify["CheckProtocol"](buffer);
        expect(result).to.equal(ParsingStatus.Ok);
    });

    it("should return WrongHeader for invalid header", () => {
        const oxxify: OxxifyProtocol = new OxxifyProtocol();

        const buffer = Buffer.from([0x00, 0x00, 0x02, 0x10, 0x00, 0x00]); // invalid header

        const result = oxxify["CheckProtocol"](buffer);
        expect(result).to.equal(ParsingStatus.WrongHeader);
    });

    it("should return WrongVersion for invalid version", () => {
        const oxxify: OxxifyProtocol = new OxxifyProtocol();

        const buffer = Buffer.from([0xfd, 0xfd, 0x01, 0x10, 0x00, 0x00]); // invalid version

        const result = oxxify["CheckProtocol"](buffer);
        expect(result).to.equal(ParsingStatus.WrongVersion);
    });

    it("should return WrongIdSize for invalid id size", () => {
        const oxxify: OxxifyProtocol = new OxxifyProtocol();

        const buffer = Buffer.from([0xfd, 0xfd, 0x02, 0x00, 0x00, 0x00]); // invalid id size

        const result = oxxify["CheckProtocol"](buffer);
        expect(result).to.equal(ParsingStatus.WrongIdSize);
    });

    it("should return ChecksumError for invalid checksum", () => {
        const oxxify: OxxifyProtocol = new OxxifyProtocol();

        const buffer = Buffer.from([0xfd, 0xfd, 0x02, 0x10, 0x00, 0x00, 0x00, 0x00]); // valid header, invalid checksum

        const result = oxxify["CheckProtocol"](buffer);
        expect(result).to.equal(ParsingStatus.ChecksumError);
    });
});
