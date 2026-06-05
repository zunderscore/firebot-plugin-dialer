export type DialNumberData = {
    tones: Array<Array<number>>;
    toneLength: number;
    delayBetween: number;
    volume: number;
}

export type DialToneData = {
    toneLength: number;
    volume: number;
}

export type BusySignalData = {
    count: number;
    fastBusy: boolean;
    volume: number;
}

export type WrongNumberData = {
    volume: number;
}

export type RingbackToneData = {
    count: number;
    volume: number;
}