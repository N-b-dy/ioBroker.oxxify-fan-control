/**
 * Model class to hold the byte buffer with the protocol data together with the IP address,
 * to which the data is sent.
 */
export class DataToSend {
    /**
     * Constructor of the class.
     *
     * @param data The byte buffer holding the data to send.
     * @param ipAddress The IP address, to which the data is sent.
     */
    public constructor(data: Buffer, ipAddress: string) {
        this.data = data;
        this.ipAddress = ipAddress;
    }

    public data: Buffer;
    public ipAddress: string;
}

/**
 * Enum to describe the parsing status of a received packet, which was processed from the protocol handler.
 */
export enum ParsingStatus {
    Ok = 1,
    WrongHeader,
    WrongVersion,
    WrongIdSize,
    ChecksumError,
    Undefined,
}

/**
 * Model class which holds the parsed data together with the unique fan identifier and the status @see ParsingStatus.
 */
export class ParsedData {
    /**
     * Default constructor to initialize the data members.
     */
    constructor() {
        this.strFanId = "";
        this.status = ParsingStatus.Undefined;
        this.receivedData = [];
    }

    strFanId: string;
    status: ParsingStatus;
    receivedData: ReceivedData[];
}

/**
 * Model class to store the received data in a format, which can directly applied to the ioBroker states.
 */
export class ReceivedData {
    /**
     * Constructor of the class.
     *
     * @param identifer The unique identifier of the fan, to which the data belongs.
     * @param value The data which can be written to an ioBroker state.
     */
    constructor(identifer: string = "", value: ioBroker.StateValue = null) {
        this.strIdentifer = identifer;
        this.value = value;
    }

    strIdentifer: string;
    value: ioBroker.StateValue;
}

/**
 * Model class which holds the necessary data for a remote endpoint together, to access it.
 */
export type FanRemoteEndpoint = {
    /**
     * The IP address of the fan.
     */
    strIpAddress: string;

    /**
     * The password of the fan for the protocol.
     */
    strPassword: string;
};

/**
 * The data model which combines all necessary information from an ioBroker state and an fan, to create a protocol frame
 * to actually send the data to the frame.
 */
export class WriteDataModel {
    /**
     * Constructor of the class.
     *
     * @param strFanId The unique fan identifier.
     * @param fanData The remote endpoint data to access the fan.
     * @param value The ioBroker state, which is requested to be written.
     */
    constructor(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue) {
        this.strFanId = strFanId;
        this.fanData = fanData;
        this.value = value;
    }

    strFanId: string;
    fanData: FanRemoteEndpoint;
    value: ioBroker.StateValue;
}

type ParseResultFunction = (b: Buffer) => ioBroker.StateValue;

/**
 * Model class to hold all necessary information together to create an ioBroker state in the object tree,
 * which is related to an data endpoint within a fan.
 */
export class FanData {
    /**
     * Constructor of the class.
     *
     * @param nSize The size of the state/parameter within the protocol in bytes.
     * @param strIdentifer The unique identifier from the fan (16 hex chars).
     * @param bIsReadable True means the parameter is readable from the fan, false means it can not be read.
     * @param bIsWritable True means the parameter is writable towards the fan, false means it can not be written.
     * @param strRole The role of the state within the object tree.
     * @param strType The data type of the state within the object tree.
     * @param name The name of the state within the object tree.
     * @param parseFunction The function which is used to parse the received data into the ioBroker state value.
     * @param strUnit The unit of the state, if available.
     * @param minValue The minimum value of the state, if available (e.g. in case of a number).
     * @param maxValue The maximum value of the state, if available (e.g. in case of a number).
     */
    constructor(
        nSize: number,
        strIdentifer: string,
        bIsReadable: boolean,
        bIsWritable: boolean,
        strRole: string,
        strType: ioBroker.CommonType,
        name: ioBroker.StringOrTranslated,
        parseFunction: ParseResultFunction,
        strUnit?: string,
        minValue?: number,
        maxValue?: number,
    ) {
        this.nSize = nSize;
        this.strIdentifer = strIdentifer;
        this.bIsReadable = bIsReadable;
        this.bIsWritable = bIsWritable;
        this.strRole = strRole;
        this.strType = strType;
        this.strUnit = strUnit;
        this.name = name;
        this.parseFunction = parseFunction;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    nSize: number;
    strIdentifer: string;
    bIsReadable: boolean;
    bIsWritable: boolean;
    strRole: string;
    strType: ioBroker.CommonType;
    name: ioBroker.StringOrTranslated;

    parseFunction: ParseResultFunction;

    strUnit: string | undefined;
    minValue?: number | undefined;
    maxValue?: number | undefined;
}
