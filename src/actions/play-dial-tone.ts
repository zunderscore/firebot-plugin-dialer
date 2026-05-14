import type { DialToneData } from "../types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { FirebotAudioOutputDevice } from "@crowbartools/firebot-custom-scripts-types/types/settings";
import { PLUGIN_ID, FRONTEND_EVENT_PLAY_DIAL_TONE } from "../constants";
import { SharedModules, delay } from "../shared";

type PlayDialToneEffectData = {
    toneLength: number;
    volume: number;
    audioOutputDevice: FirebotAudioOutputDevice;
    overlayInstance: string;
    waitForSound: boolean;
}

const PlayDialToneEffect: Effects.EffectType<
    PlayDialToneEffectData,
    DialToneData
> = {
    definition: {
        id: `${PLUGIN_ID}:play-dial-tone`,
        name: "Play Dial Tone",
        description: "Play a dial tone",
        icon: "fad fa-phone",
        categories: ["fun",  "overlay"]
    },
    optionsController: ($scope) => {
        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
    },
    optionsTemplate: `
        <eos-container header="Settings">
            <firebot-input
                input-title="Duration of the dial tone (in ms)"
                model="effect.toneLength"
                placeholder-text="Example: 200"
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
        const volume = effect.volume / 10;

        if (effect.audioOutputDevice.deviceId === "overlay") {
            sendDataToOverlay({
                toneLength: effect.toneLength,
                volume: volume
            }, effect.overlayInstance);
        } else {
            SharedModules.frontendCommunicator.fireEventAsync(FRONTEND_EVENT_PLAY_DIAL_TONE, {
                toneLength: effect.toneLength,
                volume: volume,
                audioOutputDevice: effect.audioOutputDevice
            });
        }

        if (effect.waitForSound) {
            await delay(effect.toneLength);
        }

        return true;
    },
    overlayExtension: {
        event: {
            name: `${PLUGIN_ID}:play-dial-tone`,
            onOverlayEvent: async (data) => {
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

                await playTone([350, 440]);
            }
        }
    }
}

export default PlayDialToneEffect;