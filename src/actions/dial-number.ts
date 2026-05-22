import type { DialNumberData } from "../types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { FirebotAudioOutputDevice } from "@crowbartools/firebot-custom-scripts-types/types/settings";
import { PLUGIN_ID, FRONTEND_EVENT_DIAL_NUMBER } from "../constants";
import { SharedModules, delay } from "../shared";

type DialNumberEffectData = {
    numberToDial: string;
    toneLength: number;
    delayBetween: number;
    volume: number;
    audioOutputDevice: FirebotAudioOutputDevice;
    overlayInstance: string;
    waitForSound: boolean;
}

const DialNumberEffect: Effects.EffectType<
    DialNumberEffectData,
    DialNumberData
> = {
    definition: {
        id: `${PLUGIN_ID}:dial-number`,
        name: "Dial Number",
        description: "Play DTMF tones to simulate dialing a phone number",
        icon: "fad fa-phone",
        categories: ["fun",  "overlay"]
    },
    optionsController: ($scope) => {
        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
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
                placeholder-text="Example: 50"
                style="margin-bottom: 2rem;" />
            <firebot-checkbox
                model="effect.waitForSound"
                label="Wait for sound to finish"
                tooltip="Wait for the sound to finish before letting the next effect play."
            />
        </eos-container>

        <eos-container header="Volume" pad-top="true">
            <div class="volume-slider-wrapper">
                <i class="fal fa-volume-down volume-low"></i>
                <rzslider rz-slider-model="effect.volume" rz-slider-options="{floor: 0, ceil: 10, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                <i class="fal fa-volume-up volume-high"></i>
            </div>
        </eos-container>

        <eos-audio-output-device effect="effect" pad-top="true"></eos-audio-output-device>
        
        <eos-overlay-instance effect="effect" ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" pad-top="true"></eos-overlay-instance>
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

        const volume = effect.volume / 10;
        const totalDuation = (tonesToDial.length * effect.toneLength) + ((tonesToDial.length - 1) * effect.delayBetween);

        if (effect.audioOutputDevice.deviceId === "overlay") {
            sendDataToOverlay({
                tones: tonesToDial,
                toneLength: effect.toneLength,
                delayBetween: effect.delayBetween,
                volume: volume
            }, effect.overlayInstance);
        } else {
            SharedModules.frontendCommunicator.send(FRONTEND_EVENT_DIAL_NUMBER, {
                tones: tonesToDial,
                toneLength: effect.toneLength,
                delayBetween: effect.delayBetween,
                volume: volume,
                audioOutputDevice: effect.audioOutputDevice
            });
        }

        if (effect.waitForSound) {
            await delay(totalDuation);
        }

        return true;
    },
    overlayExtension: {
        event: {
            name: `${PLUGIN_ID}:dial-number`,
            onOverlayEvent: async (data) => {
                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
                const audioCtx = new AudioContext();
                const gainNode = new GainNode(audioCtx, { gain: data.volume });
                gainNode.connect(audioCtx.destination);

                async function playTone(tone: Array<number>) {
                    return new Promise((res) => {
                        const oscillator1 = new OscillatorNode(audioCtx, { frequency: tone[0] });
                        const oscillator2 = new OscillatorNode(audioCtx, { frequency: tone[1] });

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