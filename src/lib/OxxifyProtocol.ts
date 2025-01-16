import { FanData, ParsedData, ParsingStatus, ReceivedData } from "./ModelData";

enum FunctionType {
    Undefined = 0x00,
    Read = 0x01,
    // Write = 0x02, // not used
    WriteRead = 0x03,
    // Increment = 0x04, // not used
    // Decrement = 0x05, // not used
    Response = 0x06,
}

enum ParameterType {
    FanState = 1,
    FanSpeedMode = 2,
    BoostState = 6,
    TimerMode = 7,
    TimerCountdown = 11,
    StateHumiditySensor = 15,
    StateRelaisSensor = 20,
    StateAnalogVoltageSensor = 22,
    TargetHumidityValue = 25,
    RtcBatteryVoltage = 36,
    CurrentHumidityValue = 37,
    CurrentAnalogVoltageValue = 45,
    CurrentRelaisValue = 50,
    ManualFanSpeed = 68,
    FanSpeedFan1Rpm = 74,
    FanSpeedFan2Rpm = 75,
    FilterExchangeCountdown = 100,
    ResetFilterExchangeCountdown = 101,
    BoostModeFollowUpTime = 102, // [min]
    TriggerTimeSync = 256, // Not actually part of the protocol, used as trigger to sync the time
    RtcTime = 111,
    RtcDate = 112,
    TimeControlledMode = 114,
    TimeControlSchedule = 119,
    SearchFanId = 124,
    FanPassword = 125,
    OperatingTime = 126,
    ResetAlarms = 128,
    AlarmState = 131,
    CloudServerEnabled = 133,
    FirmwareVersionAndDate = 134,
    ResetFactoryDefaults = 135,
    FilterExchangeNecessary = 136,
    WifiOperatingMode = 148,
    WifiName = 149,
    WifiPassword = 150,
    WifiEncryptionMode = 153,
    WifiChannel = 154,
    WifiIpMode = 155,
    WifiIp = 156,
    WifiSubnetMask = 157,
    WifiGateway = 158,
    ExitWifiSetupAndSafe = 160,
    ExitWifiSetupAndDiscard = 162,
    CurrentWifiIp = 163,
    FanOperatingMode = 183,
    TargetAnalogVoltageValue = 184,
    FanType = 185,

    NightModeTimerSetpoint = 0x0302,
    PartyModeTimerSetPoint = 0x0303,
    HumiditySensorOverSetPoint = 0x0304,
    AnalogVoltageSensorOverSetPoint = 0x0305,
}

/**
 * This class implements the creating of protocol frames for Oxxify fans and the parsing of received data as well.
 */
export class OxxifyProtocol {
    public constructor() {
        // Packet start
        this.internalBuffer[0] = 0xfd;
        this.internalBuffer[1] = 0xfd;

        // Protocol type
        this.internalBuffer[2] = 0x02;

        // Fan Id size
        this.internalBuffer[3] = 0x10;

        this.nWriteIndex = 4;

        this.FillstateDictionary();
    }

    public StartNewFrame(strFanId: string, strPassword: string): boolean {
        if (strFanId.length != 16) {
            return false;
        }

        if (strPassword.length <= 0) {
            return false;
        }

        // Reset the write index
        this.nWriteIndex = 4;

        // Fan id
        this.internalBuffer.write(strFanId, this.nWriteIndex);
        this.nWriteIndex += strFanId.length;

        // Size password
        this.internalBuffer[this.nWriteIndex] = strPassword.length;
        this.nWriteIndex++;

        // Password itself
        this.internalBuffer.write(strPassword, this.nWriteIndex);
        this.nWriteIndex += strPassword.length;

        this.eCurrentFunction = FunctionType.Undefined;
        this.bIsFirstFunction = true;

        this.nCurrentWriteHighByte = 0x00;

        return true;
    }

    public FinishFrame(): void {
        const checksum = this.CalculateChecksum(this.internalBuffer.subarray(2, this.nWriteIndex));

        this.internalBuffer[this.nWriteIndex] = checksum & 0xff;
        this.nWriteIndex++;

        this.internalBuffer[this.nWriteIndex] = checksum >> 8;
        this.nWriteIndex++;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    public ReadFanState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanState);
    }

    public WriteFanState(bEnabled: boolean): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        if (bEnabled) {
            data[0] = 1;
        } else {
            data[0] = 0;
        }
        this.AddParameter(ParameterType.FanState, data);
    }

    public ReadFanSpeedMode(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanSpeedMode);
    }

    public WriteFanSpeedMode(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);
        data[0] = nValue;
        console.log(`Data in Buffer: ${data[0]}`);
        this.AddParameter(ParameterType.FanSpeedMode, data);
    }

    public ReadBoostState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.BoostState);
    }

    public ReadTimerModeValues(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.TimerMode);
        this.AddParameter(ParameterType.TimerCountdown);
    }

    public WriteTimerMode(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);
        data[0] = nValue;
        this.AddParameter(ParameterType.TimerMode, data);
    }

    public ReadHumiditySensorState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.StateHumiditySensor);
    }

    public WriteHumiditySensorState(bEnabled: boolean): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        if (bEnabled) {
            data[0] = 1;
        } else {
            data[0] = 0;
        }
        this.AddParameter(ParameterType.StateHumiditySensor, data);
    }

    public ReadRelaisSensorState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.StateRelaisSensor);
    }

    public WriteRelaisSensorState(bEnabled: boolean): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        if (bEnabled) {
            data[0] = 1;
        } else {
            data[0] = 0;
        }
        this.AddParameter(ParameterType.StateRelaisSensor, data);
    }

    public ReadAnalogVoltageSensorState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.StateAnalogVoltageSensor);
    }

    public WriteAnalogVoltageSensorState(bEnabled: boolean): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        if (bEnabled) {
            data[0] = 1;
        } else {
            data[0] = 0;
        }
        this.AddParameter(ParameterType.StateAnalogVoltageSensor, data);
    }

    public ReadTargetHumidityValue(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.TargetHumidityValue);
    }

    public WriteTargetHumidityValue(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        data[0] = nValue;
        this.AddParameter(ParameterType.TargetHumidityValue, data);
    }

    public ReadRtcBattery(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.RtcBatteryVoltage);
    }

    public ReadCurrentHumidity(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.CurrentHumidityValue);
    }

    public ReadCurrentAnalogVoltage(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.CurrentAnalogVoltageValue);
    }

    public ReadCurrentRelaisState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.CurrentRelaisValue);
    }

    public ReadManualFanSpeed(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.ManualFanSpeed);
    }

    public WriteManualFanSpeed(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        data[0] = nValue;
        this.AddParameter(ParameterType.ManualFanSpeed, data);
    }

    public ReadFan1Speed(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanSpeedFan1Rpm);
    }

    public ReadFan2Speed(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanSpeedFan2Rpm);
    }

    public ReadFilterExchangeCountdown(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FilterExchangeCountdown);
    }

    public WriteResetFilterExchangeCountdown(): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const resetByte = Buffer.alloc(1);

        resetByte[0] = 0xff;
        this.AddParameter(ParameterType.ResetFilterExchangeCountdown, resetByte);
    }

    public ReadBoostModeFollowUpTime(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.BoostModeFollowUpTime);
    }

    public WriteBoostModeFollowUpTime(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        data[0] = nValue;
        this.AddParameter(ParameterType.BoostModeFollowUpTime, data);
    }

    public ReadRtcDateTime(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.RtcTime);
        this.AddParameter(ParameterType.RtcDate);
    }

    public WriteRtcDateTime(dateTime: Date): boolean {
        // It does not immediately respond with the right data
        this.AddFunctionCode(FunctionType.WriteRead);

        const rtcTime = Buffer.alloc(3);
        rtcTime[0] = dateTime.getSeconds();
        rtcTime[1] = dateTime.getMinutes();
        rtcTime[2] = dateTime.getHours();

        const rtcDate = Buffer.alloc(4);
        rtcDate[0] = dateTime.getDate();
        rtcDate[1] = dateTime.getDay();
        rtcDate[2] = dateTime.getMonth() + 1;
        rtcDate[3] = dateTime.getFullYear() % 100;

        this.AddParameter(ParameterType.RtcTime, rtcTime);
        this.AddParameter(ParameterType.RtcDate, rtcDate);

        return true;
    }

    public ReadTimeControlledMode(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.TimeControlledMode);
    }

    public WriteTimeControlledMode(bEnabled: boolean): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        if (bEnabled) {
            data[0] = 1;
        } else {
            data[0] = 0;
        }
        this.AddParameter(ParameterType.TimeControlledMode, data);
    }

    public ReadOperatingTime(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.OperatingTime);
    }

    public ReadAlarmState(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.AlarmState);
    }

    public WriteResetAlarmState(): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const resetAlarmByte = Buffer.alloc(1);

        resetAlarmByte[0] = 0xff;
        this.AddParameter(ParameterType.ResetAlarms, resetAlarmByte);
    }

    public ReadCloudServerEnabled(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.CloudServerEnabled);
    }

    public ReadFirmware(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FirmwareVersionAndDate);
    }

    public ReadFilterExchangeNecessary(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FilterExchangeNecessary);
    }

    public ReadWifiData(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.WifiOperatingMode);
        this.AddParameter(ParameterType.WifiName);
        this.AddParameter(ParameterType.WifiPassword);
        this.AddParameter(ParameterType.WifiEncryptionMode);
        this.AddParameter(ParameterType.WifiChannel);
        this.AddParameter(ParameterType.WifiIpMode);
        this.AddParameter(ParameterType.WifiIp);
        this.AddParameter(ParameterType.WifiSubnetMask);
        this.AddParameter(ParameterType.WifiGateway);
        this.AddParameter(ParameterType.CurrentWifiIp);
    }

    public ReadOperatingMode(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanOperatingMode);
    }

    public WriteOperatingMode(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        data[0] = nValue;
        this.AddParameter(ParameterType.FanOperatingMode, data);
    }

    public ReadTargetAnalogVoltageValue(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.TargetAnalogVoltageValue);
    }

    public WriteTargetAnalogVoltageValue(nValue: number): void {
        this.AddFunctionCode(FunctionType.WriteRead);
        const data = Buffer.alloc(1);

        data[0] = nValue;
        this.AddParameter(ParameterType.TargetAnalogVoltageValue, data);
    }

    public ReadFanType(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.FanType);
    }

    public ReadNightModeTimerSetPoint(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.NightModeTimerSetpoint);
    }

    public WriteNightModeTimerSetPoint(strTimeValue: string): void {
        const [nHours, nMinutes] = strTimeValue.split(":").map(Number);

        const data = Buffer.alloc(2);
        data[0] = nMinutes;
        data[1] = nHours;

        this.AddFunctionCode(FunctionType.WriteRead);
        this.AddParameter(ParameterType.NightModeTimerSetpoint, data);
    }

    public ReadPartyModeTimerSetPoint(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.PartyModeTimerSetPoint);
    }

    public WritePartyModeTimerSetPoint(strTimeValue: string): void {
        const [nHours, nMinutes] = strTimeValue.split(":").map(Number);

        const data = Buffer.alloc(2);
        data[0] = nMinutes;
        data[1] = nHours;

        this.AddFunctionCode(FunctionType.WriteRead);
        this.AddParameter(ParameterType.PartyModeTimerSetPoint, data);
    }

    public ReadHumiditySensorOverSetPoint(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.HumiditySensorOverSetPoint);
    }

    public ReadAnalogVoltageSensorOverSetPoint(): void {
        this.AddFunctionCode(FunctionType.Read);
        this.AddParameter(ParameterType.AnalogVoltageSensorOverSetPoint);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    public get ProtocolPacket(): Buffer {
        return Buffer.from(this.internalBuffer.subarray(0, this.nWriteIndex));
    }

    public ParseResponseData(dataBytes: Buffer): ParsedData {
        const status = this.CheckProtocol(dataBytes);
        const result = new ParsedData();

        this.nCurrentReadHighByte = 0x00;

        if (dataBytes == undefined) {
            result.status = ParsingStatus.Undefined;
            return result;
        }

        if (status != ParsingStatus.Ok) {
            result.status = status;
            return result;
        }

        this.nReadIndex = 4;

        // Read the 16 digit fan id
        result.strFanId = dataBytes.subarray(this.nReadIndex, this.nReadIndex + 16).toString();

        // The fan id has a fied size
        this.nReadIndex += 16;

        // Increment by the size of the password
        this.nReadIndex += dataBytes.at(this.nReadIndex) ?? 0;

        // Go further to the function byte
        this.nReadIndex++;

        let bIsDataToRead = false;

        if (dataBytes.at(this.nReadIndex) == FunctionType.Response) {
            bIsDataToRead = true;
        }

        // Start after the function byte - this is not expected to be changed within one telegram
        this.nReadIndex++;

        if (bIsDataToRead) {
            while (this.nReadIndex < dataBytes.length - 2) {
                this.nReadIndex += this.ParseData(dataBytes.subarray(this.nReadIndex), result.receivedData);
            }

            result.status = ParsingStatus.Ok;
            return result;
        }

        result.status = ParsingStatus.Undefined;
        return result;
    }

    private ParseData(data: Buffer, receivedData: ReceivedData[]): number {
        let nIndex = 0;
        let nCurrentReadParameterSize = 1;

        // Can appear additionally to the size change - Change high byte
        if (data.at(nIndex) == 0xff) {
            nIndex++;
            this.nCurrentReadHighByte = data.at(nIndex) ?? 0;
            nIndex++;
        }

        switch (data.at(nIndex)) {
            // Change response size
            case 0xfe:
                nIndex++;
                nCurrentReadParameterSize = data.at(nIndex) ?? 1;
                nIndex++;
                break;

            // Not supported low byte
            case 0xfd:
                nIndex++;
                // Index points here to the not supported low byte
                nIndex++;
                break;
        }

        const eParameter = ((data.at(nIndex) ?? 0) | (this.nCurrentReadHighByte << 8)) as ParameterType;
        nIndex++;

        if (this.stateDictionary.has(eParameter)) {
            const fanData = this.stateDictionary.get(eParameter);

            if (fanData != undefined) {
                const parsedData = new ReceivedData();
                parsedData.strIdentifer = fanData?.strIdentifer ?? "UNDEFINED";

                parsedData.value =
                    fanData?.parseFunction(data.subarray(nIndex, nIndex + nCurrentReadParameterSize)) ?? null;

                receivedData.push(parsedData);
            }
        }

        const nReturnIndex = nIndex + nCurrentReadParameterSize;

        return nReturnIndex;
    }

    /**
     * Returns the parameter dictionary, which contains all available data endpoints with the necessary
     * meta-data to create the states within the object tree.
     */
    public get StateDictionary(): Map<ParameterType, FanData> {
        return this.stateDictionary;
    }

    //#region Protected data members

    internalBuffer: Buffer = Buffer.alloc(256);
    nWriteIndex: number = 0;
    nReadIndex: number = 0;

    nCurrentReadHighByte: number = 0x00;
    nCurrentWriteHighByte: number = 0x00;

    bIsFirstFunction: boolean = false;
    eCurrentFunction: FunctionType = FunctionType.Undefined;

    // Dictionary with all available parametetrs and the index word as key (High and low byte)
    stateDictionary: Map<ParameterType, FanData> = new Map<number, FanData>();

    //#endregion

    private CheckProtocol(dataBuffer: Buffer): ParsingStatus {
        if (dataBuffer.at(0) != 0xfd && dataBuffer.at(1) != 0xfd) {
            return ParsingStatus.WrongHeader;
        }

        if (dataBuffer.at(2) != 0x02) {
            return ParsingStatus.WrongVersion;
        }

        if (dataBuffer.at(3) != 0x10) {
            return ParsingStatus.WrongIdSize;
        }

        const nCalculatedChecksum = this.CalculateChecksum(dataBuffer.subarray(2, dataBuffer.length - 2));
        const nReceivedChecksum = dataBuffer[dataBuffer.length - 2] + (dataBuffer[dataBuffer.length - 1] << 8);

        if (nCalculatedChecksum != nReceivedChecksum) {
            return ParsingStatus.ChecksumError;
        }

        return ParsingStatus.Ok;
    }

    private AddFunctionCode(eNextFunction: FunctionType): void {
        if (this.bIsFirstFunction) {
            this.bIsFirstFunction = false;
        } else {
            if (eNextFunction == this.eCurrentFunction) {
                // Nothing to do if the function code is already the right one - only the parameter index needs to be added
                return;
            }
            this.internalBuffer[this.nWriteIndex] = 0xfc;
            this.nWriteIndex++;
        }

        this.internalBuffer[this.nWriteIndex] = eNextFunction;
        this.nWriteIndex++;

        this.eCurrentFunction = eNextFunction;
    }

    /**
     * Adds an parameter for an read or an write request.
     *
     * @param eParameter The predefined enum value for the parameter, which is also teh relevant low-byte of the adressed data.
     * @param bytes The bytes to write in a Write / WriteRead request. Null in case of an read request.
     * @returns True if successful, otherwise false.
     */
    private AddParameter(eParameter: ParameterType, bytes: Buffer | null = null): boolean {
        const parameterData = this.stateDictionary.get(eParameter);

        // e.g. Variable parameter size
        if (parameterData == undefined) {
            return false;
        }

        // High byte handling (per protocol frame)
        const nHighByte = (Number(eParameter) & 0xff00) >> 8;
        const bChangeHighByte = nHighByte != this.nCurrentWriteHighByte;

        if (bChangeHighByte) {
            this.nCurrentWriteHighByte = nHighByte;

            // Special command to change the high byte
            this.internalBuffer[this.nWriteIndex] = 0xff;
            this.nWriteIndex++;

            // Add the new high byte
            this.internalBuffer[this.nWriteIndex] = nHighByte;
            this.nWriteIndex++;
        }

        // Differenz size handling (per parameter)
        if (parameterData.nSize != 1) {
            if (this.eCurrentFunction != FunctionType.Read) {
                // Special command to change the parameter sizce
                this.internalBuffer[this.nWriteIndex] = 0xfe;
                this.nWriteIndex++;

                // Add the new size
                this.internalBuffer[this.nWriteIndex] = parameterData.nSize;
                this.nWriteIndex++;
            }
        }

        this.internalBuffer[this.nWriteIndex] = eParameter as number;
        this.nWriteIndex++;

        if (this.eCurrentFunction == FunctionType.WriteRead) {
            if (bytes == null) {
                return false;
            }

            if (bytes.length == 1) {
                this.internalBuffer.writeUint8(bytes.at(0) ?? 0, this.nWriteIndex);
            } else {
                this.internalBuffer.write(bytes.toString(), this.nWriteIndex);
            }

            this.nWriteIndex += bytes.length;
        }

        return true;
    }

    private CalculateChecksum(bytes: Uint8Array): number {
        let checksum = 0;

        for (let i = 0; i < bytes.length; i++) {
            checksum += bytes[i];
        }

        return checksum & 0xffff;
    }

    private ParseFirmware(bytes: Buffer): ioBroker.StateValue {
        const nYear = (bytes.at(4) ?? 0) + ((bytes.at(5) ?? 0) << 8);
        return `v${bytes.at(0)}.${bytes.at(1)} - ${bytes.at(2)}.${bytes.at(3)}.${nYear}`;
    }

    private ParseBool(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                break;
        }

        return null;
    }

    private ParseByteNumber(byte: Buffer): ioBroker.StateValue {
        return byte.at(0) ?? null;
    }

    private ParseWordNumber(bytes: Buffer): ioBroker.StateValue {
        return (bytes.at(0) ?? 0) | ((bytes.at(1) ?? 0) << 8);
    }

    private ParseTimerMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 0:
                return "0 - Off";
            case 1:
                return "1 - Night mode";
            case 2:
                return "2 - Party mode";
        }
        return null;
    }

    private ParseFanSpeedMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 1:
                return "1 - Ventilation level 1";
            case 2:
                return "2 - Ventilation level 2";
            case 3:
                return "3 - Ventilation level 3";
            case 255:
                return "255 - Manual ventilation level";
        }
        return null;
    }

    private ParseTimeSmallToLarge(bytes: Buffer): ioBroker.StateValue {
        return `${bytes.at(2)?.toString().padStart(2, "0")}:${bytes.at(1)?.toString().padStart(2, "0")}:${bytes.at(0)?.toString().padStart(2, "0")}`;
    }

    private ParseRtcDate(bytes: Buffer): ioBroker.StateValue {
        return `${bytes.at(0)?.toString().padStart(2, "0")}.${bytes.at(2)?.toString().padStart(2, "0")}.${bytes.at(3)?.toString().padStart(2, "0")} (${bytes.at(1)} day of the week)`;
    }

    private ParseOperatingTime(bytes: Buffer): ioBroker.StateValue {
        return `${(bytes.at(2) ?? 0) | ((bytes.at(3) ?? 0) << 8)}:${bytes.at(1)?.toString().padStart(2, "0")}:${bytes.at(0)?.toString().padStart(2, "0")}`;
    }

    private ParseAlarmWarningState(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 0:
                return "0 - Nothing";
            case 1:
                return "1 - Alarm (highest priority)";
            case 2:
                return "2 - Warning";
        }
        return null;
    }

    private ParseWifiMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 1:
                return "1 - Client";
            case 2:
                return "2 - Access Point";
        }
        return null;
    }

    private ParseText(bytes: Buffer): ioBroker.StateValue {
        return bytes.toString();
    }

    private ParseWifiEncryptionMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 48:
                return "48 - Open/not encrypted";
            case 50:
                return "50 - WPA PSK";
            case 51:
                return "51 - WPA2 PSK";
            case 52:
                return "52 - WPA/WPA2 PSK";
        }
        return null;
    }

    private ParseWifiIpMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 0:
                return "0 - Static IP";
            case 1:
                return "1 - DHCP";
        }
        return null;
    }

    private ParseIpV4Value(bytes: Buffer): ioBroker.StateValue {
        return `${bytes.at(0)}.${bytes.at(1)}.${bytes.at(2)}.${bytes.at(3)}`;
    }

    private ParseOperatingMode(byte: Buffer): ioBroker.StateValue {
        switch (byte.at(0) ?? 255) {
            case 0:
                return "0 - Ventilation";
            case 1:
                return "1 - Heat recovery";
            case 2:
                return "2 - Supply air";
        }
        return null;
    }

    private ParseSystemType(bytes: Buffer): ioBroker.StateValue {
        switch (bytes.at(0) ?? 255) {
            case 0x0e:
                return "14 - Oxxify.smart 50";
        }
        return null;
    }

    private ParseHourMinuteTimer(bytes: Buffer): ioBroker.StateValue {
        return `${bytes.at(1)?.toString().padStart(2, "0")}:${bytes.at(0)?.toString().padStart(2, "0")}`;
    }

    private ParseNothing(_: Buffer): ioBroker.StateValue {
        return null;
    }

    private FillstateDictionary(): void {
        this.stateDictionary.set(
            ParameterType.FanState,
            new FanData(
                1,
                "fan.fanState",
                true,
                "switch",
                "boolean",
                {
                    en: "Fan On/Off",
                    de: "Lüfter ein/aus",
                    ru: "Включение/выключение вентилятора",
                    pt: "Ventilador ligado/desligado",
                    nl: "Ventilator aan/uit",
                    fr: "Ventilateur Marche/Arrêt",
                    it: "Ventola accesa/spenta",
                    es: "Ventilador On/Off",
                    pl: "Wentylator wł.",
                    uk: "Увімкнення/вимкнення вентилятора",
                    "zh-cn": "Fan On/Off",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.FanSpeedMode,
            new FanData(
                1,
                "fan.fanSpeedMode",
                true,
                "state",
                "string",
                {
                    en: "Number of the ventilation level",
                    de: "Nummer der Lüftungsstufe",
                    ru: "Номер уровня вентиляции",
                    pt: "Número do nível de ventilação",
                    nl: "Nummer van het ventilatieniveau",
                    fr: "Numéro du niveau de ventilation",
                    it: "Numero del livello di ventilazione",
                    es: "Número del nivel de ventilación",
                    pl: "Numer poziomu wentylacji",
                    uk: "Номер рівня вентиляції",
                    "zh-cn": "Number of the ventilation level",
                },
                this.ParseFanSpeedMode,
            ),
        );
        this.stateDictionary.set(
            ParameterType.BoostState,
            new FanData(
                1,
                "fan.boostState",
                false,
                "switch",
                "boolean",
                {
                    en: "Boost operating status on/off",
                    de: "Boost-Betriebszustand ein/aus",
                    ru: "Включение/выключение режима работы буста",
                    pt: "Estado de funcionamento do Boost ligado/desligado",
                    nl: "Bedrijfsstatus boost aan/uit",
                    fr: "Activation/désactivation de l'état de fonctionnement de l'amplificateur",
                    it: "Stato di funzionamento del boost on/off",
                    es: "Estado de funcionamiento del Boost on/off",
                    pl: "Włączanie/wyłączanie stanu pracy funkcji Boost",
                    uk: "Увімкнення/вимкнення робочого стану підсилювача",
                    "zh-cn": "Boost operating status on/off",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.TimerMode,
            new FanData(
                1,
                "fan.timerMode",
                true,
                "state",
                "mixed",
                {
                    en: "Timer mode",
                    de: "Timer-Modus",
                    ru: "Режим таймера",
                    pt: "Modo de temporizador",
                    nl: "Timermodus",
                    fr: "Mode minuterie",
                    it: "Modalità timer",
                    es: "Modo temporizador",
                    pl: "Tryb timera",
                    uk: "Режим таймера",
                    "zh-cn": "Timer mode",
                },
                this.ParseTimerMode,
                "",
                0,
                2,
            ),
        );
        this.stateDictionary.set(
            ParameterType.TimerCountdown,
            new FanData(
                3,
                "fan.timerCountDown",
                false,
                "value.time",
                "string",
                {
                    en: "Current countdown of the timer operation",
                    de: "Aktueller Countdown des Timerbetriebs",
                    ru: "Текущий отсчет времени работы таймера",
                    pt: "Contagem decrescente atual da operação do temporizador",
                    nl: "Huidig aftellen van de timer",
                    fr: "Compte à rebours actuel de l'opération de minuterie",
                    it: "Conto alla rovescia corrente del funzionamento del timer",
                    es: "Cuenta atrás actual de la operación del temporizador",
                    pl: "Bieżące odliczanie operacji timera",
                    uk: "Поточний відлік роботи таймера",
                    "zh-cn": "Current countdown of the timer operation",
                },
                this.ParseTimeSmallToLarge,
                "hh:mm:ss",
            ),
        );
        this.stateDictionary.set(
            ParameterType.StateHumiditySensor,
            new FanData(
                1,
                "sensors.stateHumiditySensor",
                true,
                "switch",
                "boolean",
                {
                    en: "Status of the humidity sensor on/off",
                    de: "Status des Feuchtigkeitssensors ein/aus",
                    ru: "Состояние датчика влажности вкл/выкл",
                    pt: "Estado do sensor de humidade ligado/desligado",
                    nl: "Status van de vochtigheidssensor aan/uit",
                    fr: "État du capteur d'humidité activé/désactivé",
                    it: "Stato del sensore di umidità on/off",
                    es: "Estado del sensor de humedad on/off",
                    pl: "Stan włączenia/wyłączenia czujnika wilgotności",
                    uk: "Стан увімкнення/вимкнення датчика вологості",
                    "zh-cn": "Status of the humidity sensor on/off",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.StateRelaisSensor,
            new FanData(
                1,
                "sensors.stateRelaisSensor",
                true,
                "switch",
                "boolean",
                {
                    en: "Status of the relay sensor on/off",
                    de: "Status des Relaissensors ein/aus",
                    ru: "Состояние датчика реле вкл/выкл",
                    pt: "Estado do sensor de relé ligado/desligado",
                    nl: "Status van de relaissensor aan/uit",
                    fr: "État du capteur de relais activé/désactivé",
                    it: "Stato del sensore a relè on/off",
                    es: "Estado del relé sensor on/off",
                    pl: "Stan włączonego/wyłączonego czujnika przekaźnika",
                    uk: "Стан увімкненого/вимкненого релейного датчика",
                    "zh-cn": "Status of the relay sensor on/off",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.StateAnalogVoltageSensor,
            new FanData(
                1,
                "sensors.stateAnalogVoltageSensor",
                true,
                "switch",
                "boolean",
                {
                    en: "Status of the analog voltage sensor on/off",
                    de: "Status des analogen Spannungssensors ein/aus",
                    ru: "Состояние аналогового датчика напряжения вкл/выкл",
                    pt: "Estado do sensor de tensão analógico ligado/desligado",
                    nl: "Status van de analoge spanningssensor aan/uit",
                    fr: "État du capteur de tension analogique activé/désactivé",
                    it: "Stato del sensore di tensione analogico on/off",
                    es: "Estado del sensor analógico de tensión on/off",
                    pl: "Stan włączenia/wyłączenia analogowego czujnika napięcia",
                    uk: "Стан увімкнення/вимкнення аналогового датчика напруги",
                    "zh-cn": "Status of the analog voltage sensor on/off",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.TargetHumidityValue,
            new FanData(
                1,
                "sensors.targetHumidityValue",
                true,
                "level.humidity",
                "number",
                {
                    en: "Humidity setpoint",
                    de: "Sollwert der Luftfeuchtigkeit",
                    ru: "Уставка влажности",
                    pt: "Ponto de regulação da humidade",
                    nl: "Vochtigheid instelpunt",
                    fr: "Consigne d'humidité",
                    it: "Setpoint di umidità",
                    es: "Consigna de humedad",
                    pl: "Wartość zadana wilgotności",
                    uk: "Уставка вологості",
                    "zh-cn": "Humidity setpoint",
                },
                this.ParseByteNumber,
                "%",
                40,
                80,
            ),
        );
        this.stateDictionary.set(
            ParameterType.RtcBatteryVoltage,
            new FanData(
                2,
                "system.rtcBatteryVoltage",
                false,
                "level.battery",
                "number",
                {
                    en: "Current RTC battery voltage",
                    de: "Aktuelle RTC-Batteriespannung",
                    ru: "Текущее напряжение батареи RTC",
                    pt: "Tensão atual da bateria RTC",
                    nl: "Huidige RTC-batterijspanning",
                    fr: "Tension actuelle de la pile RTC",
                    it: "Tensione attuale della batteria RTC",
                    es: "Tensión actual de la batería del RTC",
                    pl: "Bieżące napięcie akumulatora RTC",
                    uk: "Поточна напруга батареї RTC",
                    "zh-cn": "Current RTC battery voltage",
                },
                this.ParseWordNumber,
                "mV",
                0,
                5000,
            ),
        );
        this.stateDictionary.set(
            ParameterType.CurrentHumidityValue,
            new FanData(
                1,
                "sensors.currentHumidityValue",
                false,
                "value.humidity",
                "number",
                {
                    en: "Current humidity value",
                    de: "Aktueller Feuchtigkeitswert",
                    ru: "Текущее значение влажности",
                    pt: "Valor atual da humidade",
                    nl: "Huidige vochtigheidswaarde",
                    fr: "Valeur actuelle de l'humidité",
                    it: "Valore attuale dell'umidità",
                    es: "Valor actual de humedad",
                    pl: "Bieżąca wartość wilgotności",
                    uk: "Поточне значення вологості",
                    "zh-cn": "Current humidity value",
                },
                this.ParseByteNumber,
                "%",
                0,
                100,
            ),
        );
        this.stateDictionary.set(
            ParameterType.CurrentAnalogVoltageValue,
            new FanData(
                1,
                "sensors.currentAnalogVoltageValue",
                false,
                "value.voltage",
                "number",
                {
                    en: "Current analog voltage value",
                    de: "Aktueller analoger Spannungswert",
                    ru: "Текущее аналоговое значение напряжения",
                    pt: "Valor atual da tensão analógica",
                    nl: "Huidige analoge spanningswaarde",
                    fr: "Valeur de la tension analogique actuelle",
                    it: "Valore attuale della tensione analogica",
                    es: "Valor de tensión analógica actual",
                    pl: "Bieżąca wartość napięcia analogowego",
                    uk: "Поточне аналогове значення напруги",
                    "zh-cn": "Current analog voltage value",
                },
                this.ParseByteNumber,
                "%",
                0,
                100,
            ),
        );
        this.stateDictionary.set(
            ParameterType.CurrentRelaisValue,
            new FanData(
                1,
                "sensors.currentRelaisValue",
                false,
                "sensor",
                "boolean",
                {
                    en: "Current value of the relay sensor",
                    de: "Aktueller Wert des Relaissensors",
                    ru: "Текущее значение датчика реле",
                    pt: "Valor atual do sensor do relé",
                    nl: "Huidige waarde van de relaissensor",
                    fr: "Valeur actuelle du capteur relais",
                    it: "Valore attuale del sensore a relè",
                    es: "Valor actual del sensor del relé",
                    pl: "Bieżąca wartość czujnika przekaźnika",
                    uk: "Поточне значення датчика реле",
                    "zh-cn": "Current value of the relay sensor",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.ManualFanSpeed,
            new FanData(
                1,
                "fan.manualFanSpeed",
                true,
                "state",
                "number",
                {
                    en: "Ventilation level of the fan in operation of the manual setting",
                    de: "Lüftungsstufe des Gebläses im Betrieb der manuellen Einstellung",
                    ru: "Уровень вентиляции вентилятора в режиме ручной настройки",
                    pt: "Nível de ventilação do ventilador em funcionamento da regulação manual",
                    nl: "Ventilatieniveau van de ventilator bij gebruik van de handmatige instelling",
                    fr: "Niveau de ventilation du ventilateur en mode manuel",
                    it: "Livello di ventilazione del ventilatore in funzione dell'impostazione manuale",
                    es: "Nivel de ventilación del ventilador en funcionamiento de ajuste manual",
                    pl: "Poziom wentylacji wentylatora w trybie ręcznym",
                    uk: "Рівень вентиляції вентилятора в режимі ручного налаштування",
                    "zh-cn": "Ventilation level of the fan in operation of the manual setting",
                },
                this.ParseByteNumber,
                "",
                0,
                255,
            ),
        );
        this.stateDictionary.set(
            ParameterType.FanSpeedFan1Rpm,
            new FanData(
                2,
                "fan.fanSpeedFan1Rpm",
                false,
                "state",
                "number",
                {
                    en: "Ventilation level of fan no. 1",
                    de: "Lüftungsstufe des Ventilators Nr. 1",
                    ru: "Уровень вентиляции вентилятора № 1",
                    pt: "Nível de ventilação do ventilador n.º 1",
                    nl: "Ventilatieniveau van ventilator nr. 1",
                    fr: "Niveau de ventilation du ventilateur n° 1",
                    it: "Livello di ventilazione del ventilatore n. 1",
                    es: "Nivel de ventilación del ventilador nº 1",
                    pl: "Poziom wentylacji wentylatora nr 1",
                    uk: "Рівень вентиляції вентилятора № 1",
                    "zh-cn": "Ventilation level of fan no. 1",
                },
                this.ParseWordNumber,
                "rpm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.FanSpeedFan2Rpm,
            new FanData(
                2,
                "fan.fanSpeedFan2Rpm",
                false,
                "state",
                "number",
                {
                    en: "Ventilation level of fan no. 2",
                    de: "Lüftungsstufe des Ventilators Nr. 2",
                    ru: "Уровень вентиляции вентилятора № 2",
                    pt: "Nível de ventilação do ventilador n.º 2",
                    nl: "Ventilatieniveau van ventilator nr. 2",
                    fr: "Niveau de ventilation du ventilateur n° 2",
                    it: "Livello di ventilazione del ventilatore n. 2",
                    es: "Nivel de ventilación del ventilador nº 2",
                    pl: "Poziom wentylacji wentylatora nr 2",
                    uk: "Рівень вентиляції вентилятора № 2",
                    "zh-cn": "Ventilation level of fan no. 2",
                },
                this.ParseWordNumber,
                "rpm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.FilterExchangeCountdown,
            new FanData(
                3,
                "fan.filterExchangeCountdown",
                false,
                "state",
                "string",
                {
                    en: "Countdown of the timer until filter change",
                    de: "Countdown des Timers bis zum Filterwechsel",
                    ru: "Отсчет таймера до замены фильтра",
                    pt: "Contagem decrescente do temporizador até à mudança do filtro",
                    nl: "Aftellen van de timer tot filtervervanging",
                    fr: "Compte à rebours jusqu'au remplacement du filtre",
                    it: "Conto alla rovescia del timer fino alla sostituzione del filtro",
                    es: "Cuenta atrás del temporizador hasta el cambio de filtro",
                    pl: "Odliczanie czasu do wymiany filtra",
                    uk: "Відлік таймера до заміни фільтра",
                    "zh-cn": "Countdown of the timer until filter change",
                },
                this.ParseTimeSmallToLarge,
                "dd:hh:mm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.ResetFilterExchangeCountdown,
            new FanData(
                1,
                "fan.resetFilterExchangeCountdown",
                true,
                "button",
                "boolean",
                {
                    en: "Reset the timer countdown to the filter change",
                    de: "Zurücksetzen des Timer-Countdowns für den Filterwechsel",
                    ru: "Сбросьте таймер, отсчитывающий время до замены фильтра",
                    pt: "Reiniciar a contagem decrescente do temporizador para a mudança do filtro",
                    nl: "De timer voor het aftellen van de filtervervanging resetten",
                    fr: "Réinitialiser le compte à rebours de la minuterie pour le remplacement du filtre",
                    it: "Azzerare il conto alla rovescia del timer per la sostituzione del filtro",
                    es: "Reinicia la cuenta atrás del temporizador para el cambio de filtro",
                    pl: "Zresetuj licznik odliczający czas do wymiany filtra",
                    uk: "Скинути відлік таймера до заміни фільтра",
                    "zh-cn": "Reset the timer countdown to the filter change",
                },
                this.ParseNothing,
            ),
        );
        this.stateDictionary.set(
            ParameterType.BoostModeFollowUpTime,
            new FanData(
                1,
                "fan.boostModeFollowUpTime",
                true,
                "state",
                "number",
                {
                    en: "Setpoint of the run-on time for boost mode",
                    de: "Sollwert der Nachlaufzeit für den Boostbetrieb",
                    ru: "Уставка времени включения для режима форсирования",
                    pt: "Ponto de regulação do tempo de arranque para o modo de impulso",
                    nl: "Instelpunt van de aanlooptijd voor boostmodus",
                    fr: "Point de consigne de la durée de fonctionnement en mode boost",
                    it: "Setpoint del tempo di funzionamento in modalità boost",
                    es: "Consigna del tiempo de marcha en inercia para el modo boost",
                    pl: "Wartość zadana czasu rozruchu dla trybu doładowania",
                    uk: "Уставка часу вибігу для режиму прискорення",
                    "zh-cn": "Setpoint of the run-on time for boost mode",
                },
                this.ParseByteNumber,
                "min",
                0,
                60,
            ),
        );

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.stateDictionary.set(
            ParameterType.TriggerTimeSync,
            new FanData(
                0,
                "system.triggerRtcTimeSync",
                true,
                "button",
                "boolean",
                {
                    en: "Synchronize time",
                    de: "Zeit synchronisieren",
                    ru: "Синхронизация времени",
                    pt: "Sincronizar a hora",
                    nl: "Tijd synchroniseren",
                    fr: "Synchroniser l'heure",
                    it: "Sincronizzare l'ora",
                    es: "Sincronizar la hora",
                    pl: "Synchronizacja czasu",
                    uk: "Синхронізувати час",
                    "zh-cn": "Synchronize time",
                },
                this.ParseNothing,
            ),
        );

        this.stateDictionary.set(
            ParameterType.RtcTime,
            new FanData(
                3,
                "system.rtcTime",
                false,
                "value.time",
                "string",
                {
                    en: "RTC time",
                    de: "RTC-Zeit",
                    ru: "Время РТК",
                    pt: "Tempo RTC",
                    nl: "RTC-tijd",
                    fr: "Temps RTC",
                    it: "Tempo RTC",
                    es: "Hora RTC",
                    pl: "Czas RTC",
                    uk: "Час за київським часом",
                    "zh-cn": "RTC time",
                },
                this.ParseTimeSmallToLarge,
                "hh:mm:ss",
            ),
        );
        this.stateDictionary.set(
            ParameterType.RtcDate,
            new FanData(
                4,
                "system.rtcCalendar",
                false,
                "value.date",
                "string",
                {
                    en: "RTC calendar",
                    de: "RTC-Kalender",
                    ru: "Календарь РТК",
                    pt: "Calendário RTC",
                    nl: "RTC-kalender",
                    fr: "Calendrier RTC",
                    it: "Calendario RTC",
                    es: "Calendario RTC",
                    pl: "Kalendarz RTC",
                    uk: "Календар RTC",
                    "zh-cn": "RTC calendar",
                },
                this.ParseRtcDate,
                "dd.mm.yy",
            ),
        );
        this.stateDictionary.set(
            ParameterType.TimeControlledMode,
            new FanData(
                1,
                "fan.timeControlledMode",
                true,
                "switch",
                "boolean",
                {
                    en: "Time-controlled operation",
                    de: "Zeitgesteuerter Betrieb",
                    ru: "Работа с контролем времени",
                    pt: "Funcionamento com controlo de tempo",
                    nl: "Tijdgestuurde werking",
                    fr: "Fonctionnement à temps contrôlé",
                    it: "Funzionamento a tempo",
                    es: "Funcionamiento temporizado",
                    pl: "Działanie sterowane czasem",
                    uk: "Регульована за часом робота",
                    "zh-cn": "Time-controlled operation",
                },
                this.ParseBool,
            ),
        );

        // this.stateDictionary.set(ParameterType.TimeControlSchedule, 6);
        // this.stateDictionary.set(ParameterType.SearchFanId, 16);
        // this.stateDictionary.set(ParameterType.FanPassword, -1);

        this.stateDictionary.set(
            ParameterType.OperatingTime,
            new FanData(
                4,
                "system.operatingTime",
                false,
                "state",
                "string",
                {
                    en: "Operating hours",
                    de: "Betriebsstunden",
                    ru: "Часы работы",
                    pt: "Horas de funcionamento",
                    nl: "Bedrijfsuren",
                    fr: "Heures de fonctionnement",
                    it: "Orario di funzionamento",
                    es: "Horas de funcionamiento",
                    pl: "Godziny pracy",
                    uk: "Години роботи",
                    "zh-cn": "Operating hours",
                },
                this.ParseOperatingTime,
                "ddddd:hh:mm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.ResetAlarms,
            new FanData(
                1,
                "system.resetAlarms",
                true,
                "button",
                "boolean",
                {
                    en: "Reset alarms",
                    de: "Alarme zurücksetzen",
                    ru: "Сброс сигналов тревоги",
                    pt: "Repor alarmes",
                    nl: "Reset alarmen",
                    fr: "Réinitialisation des alarmes",
                    it: "Ripristino degli allarmi",
                    es: "Restablecer alarmas",
                    pl: "Resetowanie alarmów",
                    uk: "Скидання тривог",
                    "zh-cn": "Reset alarms",
                },
                this.ParseNothing,
            ),
        );
        this.stateDictionary.set(
            ParameterType.AlarmState,
            new FanData(
                1,
                "system.alarmState",
                false,
                "switch",
                "string",
                {
                    en: "Alarm/warning display",
                    de: "Alarm-/Warnungsanzeige",
                    ru: "Индикация сигналов тревоги/предупреждений",
                    pt: "Indicação de alarme/aviso",
                    nl: "Weergave alarm/waarschuwing",
                    fr: "Affichage des alarmes et avertissements",
                    it: "Display di allarme/avviso",
                    es: "Indicación de alarma/aviso",
                    pl: "Wyświetlacz alarmu/ostrzeżenia",
                    uk: "Індикація тривоги/попередження",
                    "zh-cn": "Alarm/warning display",
                },
                this.ParseAlarmWarningState,
            ),
        );
        this.stateDictionary.set(
            ParameterType.CloudServerEnabled,
            new FanData(
                1,
                "network.cloudServerEnabled",
                false,
                "switch",
                "boolean",
                {
                    en: "Approval of operation via cloud server",
                    de: "Freigabe des Betriebs über Cloud-Server",
                    ru: "Утверждение операций через облачный сервер",
                    pt: "Aprovação da operação através do servidor em nuvem",
                    nl: "Goedkeuring van werking via cloudserver",
                    fr: "Approbation de l'opération via un serveur en nuage",
                    it: "Approvazione del funzionamento tramite server cloud",
                    es: "Aprobación del funcionamiento a través del servidor en nube",
                    pl: "Zatwierdzanie operacji za pośrednictwem serwera w chmurze",
                    uk: "Затвердження роботи через хмарний сервер",
                    "zh-cn": "Approval of operation via cloud server",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.FirmwareVersionAndDate,
            new FanData(
                6,
                "system.firmwareVersionAndDate",
                false,
                "info.firmware",
                "string",
                {
                    en: "Firmware version and date of the control unit",
                    de: "Firmware-Version und Datum des Steuergeräts",
                    ru: "Версия и дата прошивки блока управления",
                    pt: "Versão e data do firmware da unidade de controlo",
                    nl: "Firmwareversie en -datum van de besturingseenheid",
                    fr: "Version et date du micrologiciel de l'unité de contrôle",
                    it: "Versione e data del firmware della centralina",
                    es: "Versión y fecha del firmware de la unidad de control",
                    pl: "Wersja i data oprogramowania układowego jednostki sterującej",
                    uk: "Версія прошивки та дата випуску блоку управління",
                    "zh-cn": "Firmware version and date of the control unit",
                },
                this.ParseFirmware,
            ),
        );

        // this.stateDictionary.set(ParameterType.ResetFactoryDefaults, 1);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.stateDictionary.set(
            ParameterType.FilterExchangeNecessary,
            new FanData(
                1,
                "fan.filterExchangeNecessary",
                false,
                "state",
                "boolean",
                {
                    en: "Filter change indicator",
                    de: "Filterwechselanzeige",
                    ru: "Индикатор замены фильтра",
                    pt: "Indicador de mudança de filtro",
                    nl: "Indicator voor filtervervanging",
                    fr: "Indicateur de changement de filtre",
                    it: "Indicatore di sostituzione del filtro",
                    es: "Indicador de cambio de filtro",
                    pl: "Wskaźnik wymiany filtra",
                    uk: "Індикатор заміни фільтра",
                    "zh-cn": "Filter change indicator",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiOperatingMode,
            new FanData(
                1,
                "network.wifiOperatingMode",
                false,
                "state",
                "string",
                {
                    en: "WLAN operation mode",
                    de: "WLAN-Betriebsart",
                    ru: "Режим работы WLAN",
                    pt: "Modo de funcionamento WLAN",
                    nl: "WLAN-bedieningsmodus",
                    fr: "Mode de fonctionnement WLAN",
                    it: "Modalità di funzionamento WLAN",
                    es: "Modo de funcionamiento WLAN",
                    pl: "Tryb pracy WLAN",
                    uk: "Режим роботи WLAN",
                    "zh-cn": "WLAN operation mode",
                },
                this.ParseWifiMode,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiName,
            new FanData(
                -1,
                "network.wifiName",
                false,
                "state",
                "string",
                {
                    en: "WLAN name in client mode",
                    de: "WLAN-Name im Client-Modus",
                    ru: "Имя беспроводной локальной сети в режиме клиента",
                    pt: "Nome da WLAN no modo de cliente",
                    nl: "WLAN-naam in clientmodus",
                    fr: "Nom du WLAN en mode client",
                    it: "Nome della WLAN in modalità client",
                    es: "Nombre de la WLAN en modo cliente",
                    pl: "Nazwa sieci WLAN w trybie klienta",
                    uk: "Ім'я бездротової локальної мережі в режимі клієнта",
                    "zh-cn": "WLAN name in client mode",
                },
                this.ParseText,
            ),
        );
        // this.stateDictionary.set(ParameterType.WifiPassword, -1);
        this.stateDictionary.set(
            ParameterType.WifiEncryptionMode,
            new FanData(
                1,
                "network.wifiEncryptionMode",
                false,
                "state",
                "string",
                {
                    en: "WLAN encryption technology",
                    de: "WLAN-Verschlüsselungstechnologie",
                    ru: "Технология шифрования WLAN",
                    pt: "Tecnologia de encriptação WLAN",
                    nl: "WLAN-coderingstechnologie",
                    fr: "Technologie de cryptage WLAN",
                    it: "Tecnologia di crittografia WLAN",
                    es: "Tecnología de cifrado WLAN",
                    pl: "Technologia szyfrowania WLAN",
                    uk: "Технологія шифрування WLAN",
                    "zh-cn": "WLAN encryption technology",
                },
                this.ParseWifiEncryptionMode,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiChannel,
            new FanData(
                1,
                "network.wifiChannel",
                false,
                "state",
                "number",
                {
                    en: "WLAN channel frequency",
                    de: "WLAN-Kanalfrequenz",
                    ru: "Частота канала WLAN",
                    pt: "Frequência do canal WLAN",
                    nl: "WLAN-kanaalfrequentie",
                    fr: "Fréquence du canal WLAN",
                    it: "Frequenza del canale WLAN",
                    es: "Frecuencia del canal WLAN",
                    pl: "Częstotliwość kanału WLAN",
                    uk: "Частота каналу WLAN",
                    "zh-cn": "WLAN channel frequency",
                },
                this.ParseByteNumber,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiIpMode,
            new FanData(
                1,
                "network.wifiIpMode",
                false,
                "state",
                "string",
                {
                    en: "WLAN module DHCP",
                    de: "WLAN-Modul DHCP",
                    ru: "Модуль WLAN DHCP",
                    pt: "Módulo WLAN DHCP",
                    nl: "WLAN-module DHCP",
                    fr: "Module WLAN DHCP",
                    it: "Modulo WLAN DHCP",
                    es: "Módulo WLAN DHCP",
                    pl: "Moduł WLAN DHCP",
                    uk: "Модуль бездротової локальної мережі DHCP",
                    "zh-cn": "WLAN module DHCP",
                },
                this.ParseWifiIpMode,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiIp,
            new FanData(
                4,
                "network.wifiIpMode",
                false,
                "info.ip",
                "string",
                {
                    en: "Assigned IP address of the WLAN module",
                    de: "Zugewiesene IP-Adresse des WLAN-Moduls",
                    ru: "Назначенный IP-адрес модуля WLAN",
                    pt: "Endereço IP atribuído ao módulo WLAN",
                    nl: "Toegewezen IP-adres van de WLAN-module",
                    fr: "Adresse IP attribuée au module WLAN",
                    it: "Indirizzo IP assegnato del modulo WLAN",
                    es: "Dirección IP asignada del módulo WLAN",
                    pl: "Przypisany adres IP modułu WLAN",
                    uk: "Присвоєна IP-адреса модуля WLAN",
                    "zh-cn": "Assigned IP address of the WLAN module",
                },
                this.ParseIpV4Value,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiSubnetMask,
            new FanData(
                4,
                "network.wifiSubnetMask",
                false,
                "info.ip",
                "string",
                {
                    en: "Subnet mask of the WLAN module",
                    de: "Subnetzmaske des WLAN-Moduls",
                    ru: "Маска подсети модуля WLAN",
                    pt: "Máscara de sub-rede do módulo WLAN",
                    nl: "Subnetmasker van de WLAN-module",
                    fr: "Masque de sous-réseau du module WLAN",
                    it: "Maschera di sottorete del modulo WLAN",
                    es: "Máscara de subred del módulo WLAN",
                    pl: "Maska podsieci modułu WLAN",
                    uk: "Маска підмережі модуля WLAN",
                    "zh-cn": "Subnet mask of the WLAN module",
                },
                this.ParseIpV4Value,
            ),
        );
        this.stateDictionary.set(
            ParameterType.WifiGateway,
            new FanData(
                4,
                "network.wifiGateway",
                false,
                "info.ip",
                "string",
                {
                    en: "Main gateway of the WLAN module",
                    de: "Haupt-Gateway des WLAN-Moduls",
                    ru: "Главный шлюз модуля WLAN",
                    pt: "Gateway principal do módulo WLAN",
                    nl: "Hoofdgateway van de WLAN-module",
                    fr: "Passerelle principale du module WLAN",
                    it: "Gateway principale del modulo WLAN",
                    es: "Pasarela principal del módulo WLAN",
                    pl: "Brama główna modułu WLAN",
                    uk: "Головний шлюз модуля WLAN",
                    "zh-cn": "Main gateway of the WLAN module",
                },
                this.ParseIpV4Value,
            ),
        );
        // this.stateDictionary.set(ParameterType.ExitWifiSetupAndSafe, 1);
        // this.stateDictionary.set(ParameterType.ExitWifiSetupAndDiscard, 1);
        this.stateDictionary.set(
            ParameterType.CurrentWifiIp,
            new FanData(
                4,
                "network.currentWifiIp",
                false,
                "info.ip",
                "string",
                {
                    en: "Current IP address of the WLAN module",
                    de: "Aktuelle IP-Adresse des WLAN-Moduls",
                    ru: "Текущий IP-адрес модуля WLAN",
                    pt: "Endereço IP atual do módulo WLAN",
                    nl: "Huidig IP-adres van de WLAN-module",
                    fr: "Adresse IP actuelle du module WLAN",
                    it: "Indirizzo IP attuale del modulo WLAN",
                    es: "Dirección IP actual del módulo WLAN",
                    pl: "Aktualny adres IP modułu WLAN",
                    uk: "Поточна IP-адреса модуля бездротової локальної мережі",
                    "zh-cn": "Current IP address of the WLAN module",
                },
                this.ParseIpV4Value,
            ),
        );
        this.stateDictionary.set(
            ParameterType.FanOperatingMode,
            new FanData(
                1,
                "fan.fanOperatingMode",
                true,
                "state",
                "mixed",
                {
                    en: "Operating mode of the fan",
                    de: "Betriebsart des Ventilators",
                    ru: "Режим работы вентилятора",
                    pt: "Modo de funcionamento do ventilador",
                    nl: "Werkingsmodus van de ventilator",
                    fr: "Mode de fonctionnement du ventilateur",
                    it: "Modalità di funzionamento del ventilatore",
                    es: "Modo de funcionamiento del ventilador",
                    pl: "Tryb pracy wentylatora",
                    uk: "Режим роботи вентилятора",
                    "zh-cn": "Operating mode of the fan",
                },
                this.ParseOperatingMode,
                "",
                0,
                2,
            ),
        );
        this.stateDictionary.set(
            ParameterType.TargetAnalogVoltageValue,
            new FanData(
                1,
                "sensors.targetAnalogVoltageValue",
                true,
                "state",
                "number",
                {
                    en: "Setpoint of the sensor 0-10 V",
                    de: "Sollwert des Sensors 0-10 V",
                    ru: "Уставка датчика 0-10 В",
                    pt: "Ponto de regulação do sensor 0-10 V",
                    nl: "Instelpunt van de sensor 0-10 V",
                    fr: "Point de consigne du capteur 0-10 V",
                    it: "Setpoint del sensore 0-10 V",
                    es: "Consigna del sensor 0-10 V",
                    pl: "Wartość zadana czujnika 0-10 V",
                    uk: "Уставка датчика 0-10 В",
                    "zh-cn": "Setpoint of the sensor 0-10 V",
                },
                this.ParseByteNumber,
                "%",
                5,
                100,
            ),
        );
        this.stateDictionary.set(
            ParameterType.FanType,
            new FanData(
                2,
                "system.fanType",
                false,
                "state",
                "string",
                {
                    en: "System type",
                    de: "Anlagentyp",
                    ru: "Тип системы",
                    pt: "Tipo de sistema",
                    nl: "Type systeem",
                    fr: "Type de système",
                    it: "Tipo di sistema",
                    es: "Tipo de sistema",
                    pl: "Typ systemu",
                    uk: "Тип системи",
                    "zh-cn": "System type",
                },
                this.ParseSystemType,
            ),
        );

        // High byte 0x03 starting from here
        this.stateDictionary.set(
            ParameterType.NightModeTimerSetpoint,
            new FanData(
                2,
                "fan.nightModeTimerSetpoint",
                true,
                "state",
                "string",
                {
                    en: "Setpoint of the timer for night mode",
                    de: "Sollwert der Zeitschaltuhr für den Nachtbetrieb",
                    ru: "Уставка таймера для ночного режима",
                    pt: "Ponto de regulação do temporizador para o modo noturno",
                    nl: "Instelpunt van de timer voor nachtmodus",
                    fr: "Point de consigne de la minuterie pour le mode nuit",
                    it: "Setpoint del timer per la modalità notturna",
                    es: "Consigna del temporizador para el modo nocturno",
                    pl: "Wartość zadana timera dla trybu nocnego",
                    uk: "Уставка таймера для нічного режиму",
                    "zh-cn": "Setpoint of the timer for night mode",
                },
                this.ParseHourMinuteTimer,
                "hh:mm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.PartyModeTimerSetPoint,
            new FanData(
                2,
                "fan.partyModeTimerSetpoint",
                true,
                "state",
                "string",
                {
                    en: "Setpoint of the timer for party mode",
                    de: "Sollwert des Timers für den Partybetrieb",
                    ru: "Уставка таймера для режима вечеринки",
                    pt: "Ponto de regulação do temporizador para o modo de festa",
                    nl: "Instelpunt van de timer voor partymodus",
                    fr: "Point de consigne de la minuterie pour le mode fête",
                    it: "Setpoint del timer per la modalità party",
                    es: "Consigna del temporizador para el modo fiesta",
                    pl: "Wartość zadana timera dla trybu party",
                    uk: "Уставка таймера для режиму вечірки",
                    "zh-cn": "Setpoint of the timer for party mode",
                },
                this.ParseHourMinuteTimer,
                "hh:mm",
            ),
        );
        this.stateDictionary.set(
            ParameterType.HumiditySensorOverSetPoint,
            new FanData(
                1,
                "sensors.humiditySensorOverSetPoint",
                false,
                "state",
                "boolean",
                {
                    en: "Humidity sensor is above set value",
                    de: "Luftfeuchtigkeitssensor liegt über dem eingestellten Wert",
                    ru: "Датчик влажности превышает установленное значение",
                    pt: "O sensor de humidade está acima do valor definido",
                    nl: "Vochtigheidssensor is hoger dan de ingestelde waarde",
                    fr: "Le capteur d'humidité est au-dessus de la valeur réglée",
                    it: "Il sensore di umidità supera il valore impostato",
                    es: "El sensor de humedad está por encima del valor ajustado",
                    pl: "Czujnik wilgotności przekracza ustawioną wartość",
                    uk: "Датчик вологості перевищує встановлене значення",
                    "zh-cn": "Humidity sensor is above set value",
                },
                this.ParseBool,
            ),
        );
        this.stateDictionary.set(
            ParameterType.AnalogVoltageSensorOverSetPoint,
            new FanData(
                1,
                "sensors.analogVoltageSensorOverSetPoint",
                false,
                "state",
                "boolean",
                {
                    en: "Analog voltage sensor is above setpoint",
                    de: "Analoger Spannungssensor liegt über dem Sollwert",
                    ru: "Аналоговый датчик напряжения выше заданного значения",
                    pt: "O sensor de tensão analógica está acima do ponto de regulação",
                    nl: "Analoge spanningssensor is boven setpoint",
                    fr: "Le capteur de tension analogique est au-dessus du point de consigne",
                    it: "Il sensore di tensione analogico è superiore al setpoint",
                    es: "El sensor analógico de tensión está por encima de la consigna",
                    pl: "Analogowy czujnik napięcia jest powyżej wartości zadanej",
                    uk: "Аналоговий датчик напруги вище заданого значення",
                    "zh-cn": "Analog voltage sensor is above setpoint",
                },
                this.ParseBool,
            ),
        );
    }
}
