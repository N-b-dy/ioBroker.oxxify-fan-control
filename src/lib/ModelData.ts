export class DataToSend {
    public constructor(data: Buffer, ipAddress: string) {
        this.data = data;
        this.ipAddress = ipAddress;
    }

    public data: Buffer;
    public ipAddress: string;
}

export enum ParsingStatus {
    Ok = 1,
    WrongHeader,
    WrongVersion,
    WrongIdSize,
    ChecksumError,
    Undefined,
}

export class ParsedData {
    constructor() {
        this.strFanId = "";
        this.status = ParsingStatus.Undefined;
        this.receivedData = [];
    }

    strFanId: string;
    status: ParsingStatus;
    receivedData: ReceivedData[];
}

export class ReceivedData {
    constructor(identifer: string = "", value: ioBroker.StateValue = null) {
        this.strIdentifer = identifer;
        this.value = value;
    }

    strIdentifer: string;
    value: ioBroker.StateValue;
}
