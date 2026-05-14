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