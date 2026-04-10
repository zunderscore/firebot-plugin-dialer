import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { FirebotAudioOutputDevice } from "@crowbartools/firebot-custom-scripts-types/types/settings";
import { PLUGIN_ID } from "../constants";

type DialNumberEffectData = {
    numberToDial: string;
    toneLength: number;
    delayBetween: number;
    audioOutputDevice: FirebotAudioOutputDevice;
    overlayInstance: string;
}

type DialNumberEffectOverlayData = {
    tones: Array<Array<number>>;
    toneLength: number;
    delayBetween: number;
}

const DialNumberEffect: Effects.EffectType<
    DialNumberEffectData,
    DialNumberEffectOverlayData
> = {
    definition: {
        id: `${PLUGIN_ID}:dial-number`,
        name: "Dial Number",
        description: "Play DTMF tones to simulate dialing a phone number",
        icon: "fad fa-phone",
        categories: ["fun",  "overlay"]
    },
    optionsTemplate: `
        <eos-container header="Number to Dial">
            <firebot-input
                input-title="Number to dial"
                model="effect.numberToDial"
                placeholder-text="Example: 212 555 1234" />
        </eos-container>

        <eos-container header="Settings">
            <firebot-input
                input-title="Duration of each tone (in ms)"
                model="effect.toneLength"
                placeholder-text="Example: 200"
                style="margin-bottom: 2rem;" />
            <firebot-input
                input-title="Delay between tones (in ms)"
                model="effect.delayBetween"
                placeholder-text="Example: 50" />
        </eos-container>

        <eos-audio-output-device effect="effect" pad-top="true"></eos-audio-output-device>
        
        <eos-overlay-instance effect="effect" pad-top="true"></eos-overlay-instance>
    `,
    onTriggerEvent: async ({ effect, sendDataToOverlay }) => {
        const tones: Record<string, Array<number>> = {
            "1": [697, 1209],
            "2": [697, 1336],
            "3": [697, 1477],
            "4": [770, 1209],
            "5": [770, 1336],
            "6": [770, 1477],
            "7": [852, 1209],
            "8": [852, 1336],
            "9": [852, 1477],
            "*": [941, 1209],
            "0": [941, 1336],
            "#": [941, 1477],
        };

        const numbersToDial = [...effect.numberToDial];
        const tonesToDial = [];

        for (const num of numbersToDial) {
            if (tones.hasOwnProperty(num)) {
                tonesToDial.push(tones[num]);
            }
        }

        if (effect.audioOutputDevice.deviceId === "overlay") {
            sendDataToOverlay({
                tones: tonesToDial,
                toneLength: effect.toneLength,
                delayBetween: effect.delayBetween
            }, effect.overlayInstance);
        } else {

        }
    },
    overlayExtension: {
        event: {
            name: `${PLUGIN_ID}:dial-numbers`,
            onOverlayEvent: async (data) => {
                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
                const audioCtx = new AudioContext();
                const gainNode = new GainNode(audioCtx);
                gainNode.connect(audioCtx.destination);

                async function playTone(tone: Array<number>) {
                    return new Promise((res) => {
                        const oscillator1 = new OscillatorNode(audioCtx, { frequency: tone[0] });
                        const oscillator2 = new OscillatorNode(audioCtx, { frequency: tone[1] });

                        console.log(oscillator1);
                        console.log(oscillator2);

                        oscillator1.connect(gainNode);
                        oscillator2.connect(gainNode);
                        oscillator1.start();
                        oscillator2.start();

                        oscillator1.onended = res;

                        oscillator1.stop(audioCtx.currentTime + (data.toneLength / 1000));
                        oscillator2.stop(audioCtx.currentTime + (data.toneLength / 1000));
                    });
                }

                for (let x = 0; x < data.tones.length - 1; x++) {
                    await playTone(data.tones[x]);
                    await delay(data.delayBetween);
                }

                await playTone(data.tones[data.tones.length - 1]);
            }
        }
    }
}

export default DialNumberEffect;