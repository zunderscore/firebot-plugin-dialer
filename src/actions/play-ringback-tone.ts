import type { RingbackToneData } from "../types";
import firebot, { EffectType, FirebotAudioDevice } from "@crowbartools/firebot-types";
import { PLUGIN_ID, FRONTEND_EVENT_PLAY_RINGBACK_TONE } from "../constants";
import { delay } from "../shared";

type PlayRingbackToneEffectData = {
    count: number;
    volume: number;
    audioOutputDevice: FirebotAudioDevice;
    overlayInstance: string;
    waitForSound: boolean;
}

const PlayRingbackToneEffect: EffectType<
    PlayRingbackToneEffectData,
    RingbackToneData
> = {
    definition: {
        id: `${PLUGIN_ID}:play-ringback-tone`,
        name: "Play Ringback Tone",
        description: "Plays a ringback tone",
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
                input-title="Number of times to play"
                model="effect.count"
                placeholder-text="Example: 2"
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
        const count = effect.count ?? 1;
        const volume = effect.volume / 10;
        const totalDuation = ((count * 6) - 4) * 1000;

        if (effect.audioOutputDevice.deviceId === "overlay") {
            sendDataToOverlay({
                count: count,
                volume: volume
            }, effect.overlayInstance);
        } else {
            firebot.frontendCommunicator.fireEventAsync(FRONTEND_EVENT_PLAY_RINGBACK_TONE, {
                count: count,
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
            name: `${PLUGIN_ID}:play-ringback-tone`,
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

                        oscillator1.stop(audioCtx.currentTime + 2);
                        oscillator2.stop(audioCtx.currentTime + 2);
                    });
                }

                for (let x = 0; x < data.count - 1; x++) {
                    await playTone([440, 480]);
                    await delay(4000);
                }

                await playTone([440, 480]);
            }
        }
    }
}

export default PlayRingbackToneEffect;