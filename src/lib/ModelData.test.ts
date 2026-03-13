/**
 * This is a TypeScript test file using chai and mocha for ModelData classes
 */

import { expect } from "chai";
import {
    DataToSend,
    FanData,
    FanRemoteEndpoint,
    IoBrokerDataPoint,
    IoBrokerRewriteDataPoint,
    ParsedData,
    ParsingStatus,
    WriteDataModel,
} from "./ModelData";

describe("ModelData => DataToSend", () => {
    it("should create DataToSend with correct data and ipAddress", () => {
        const buffer = Buffer.from([0x01, 0x02]);
        const ip = "192.168.1.1";
        const dataToSend = new DataToSend(buffer, ip);

        expect(dataToSend.data).to.deep.equal(buffer);
        expect(dataToSend.ipAddress).to.equal(ip);
    });
});

describe("ModelData => ParsedData", () => {
    it("should initialize ParsedData with default values", () => {
        const parsedData = new ParsedData();

        expect(parsedData.strFanId).to.equal("");
        expect(parsedData.bFrameIsResponse).to.be.false;
        expect(parsedData.status).to.equal(ParsingStatus.Undefined);
        expect(parsedData.receivedData).to.deep.equal([]);
    });
});

describe("ModelData => IoBrokerDataPoint", () => {
    it("should create IoBrokerDataPoint with default values", () => {
        const dp = new IoBrokerDataPoint();

        expect(dp.strIdentifer).to.equal("");
        expect(dp.value).to.be.null;
    });

    it("should create IoBrokerDataPoint with provided values", () => {
        const ident = "test.id";
        const value = 42;
        const dp = new IoBrokerDataPoint(ident, value);

        expect(dp.strIdentifer).to.equal(ident);
        expect(dp.value).to.equal(value);
    });
});

describe("ModelData => IoBrokerRewriteDataPoint", () => {
    it("should create IoBrokerRewriteDataPoint with nRetryCount initialized to 0", () => {
        const ident = "test.id";
        const value = "test";
        const dp = new IoBrokerRewriteDataPoint(ident, value);

        expect(dp.strIdentifer).to.equal(ident);
        expect(dp.value).to.equal(value);
        expect(dp.nRetryCount).to.equal(0);
    });
});

describe("ModelData => FanRemoteEndpoint", () => {
    it("should create FanRemoteEndpoint with default values", () => {
        const endpoint = new FanRemoteEndpoint("", "");

        expect(endpoint.strIpAddress).to.equal("");
        expect(endpoint.strPassword).to.equal("");
    });

    it("should create FanRemoteEndpoint with provided values", () => {
        const ip = "192.168.1.100";
        const pass = "password123";
        const endpoint = new FanRemoteEndpoint(ip, pass);

        expect(endpoint.strIpAddress).to.equal(ip);
        expect(endpoint.strPassword).to.equal(pass);
    });
});

describe("ModelData => WriteDataModel", () => {
    it("should create WriteDataModel with provided values", () => {
        const fanId = "1234567890abcdef";
        const endpoint = new FanRemoteEndpoint("192.168.1.1", "pass");
        const stateId = "devices.1234567890abcdef.fans.fanState";
        const value = true;

        const writeData = new WriteDataModel(fanId, endpoint, stateId, value);

        expect(writeData.strFanId).to.equal(fanId);
        expect(writeData.fanData).to.equal(endpoint);
        expect(writeData.strStateIdentifier).to.equal(stateId);
        expect(writeData.value).to.equal(value);
    });
});

describe("ModelData => FanData", () => {
    it("should create FanData with all parameters", () => {
        const parseFunc = (b: Buffer): number => b.readUInt8(0);
        const states = { 0: "off", 1: "on" };

        const fanData = new FanData(
            1,
            "fanState",
            true,
            true,
            "switch",
            "boolean",
            "Fan State",
            parseFunc,
            undefined,
            0,
            1,
            states,
        );

        expect(fanData.nSize).to.equal(1);
        expect(fanData.strIdentifer).to.equal("fanState");
        expect(fanData.bIsReadable).to.be.true;
        expect(fanData.bIsWritable).to.be.true;
        expect(fanData.strRole).to.equal("switch");
        expect(fanData.strType).to.equal("boolean");
        expect(fanData.name).to.equal("Fan State");
        expect(fanData.parseFunction).to.equal(parseFunc);
        expect(fanData.strUnit).to.be.undefined;
        expect(fanData.minValue).to.equal(0);
        expect(fanData.maxValue).to.equal(1);
        expect(fanData.states).to.equal(states);
    });

    it("should create FanData with minimal parameters", () => {
        const parseFunc = (b: Buffer): string => b.toString();

        const fanData = new FanData(4, "version", true, false, "info", "string", "Version", parseFunc);

        expect(fanData.nSize).to.equal(4);
        expect(fanData.strIdentifer).to.equal("version");
        expect(fanData.bIsReadable).to.be.true;
        expect(fanData.bIsWritable).to.be.false;
        expect(fanData.strRole).to.equal("info");
        expect(fanData.strType).to.equal("string");
        expect(fanData.name).to.equal("Version");
        expect(fanData.parseFunction).to.equal(parseFunc);
        expect(fanData.strUnit).to.be.undefined;
        expect(fanData.minValue).to.be.undefined;
        expect(fanData.maxValue).to.be.undefined;
        expect(fanData.states).to.be.undefined;
    });
});
