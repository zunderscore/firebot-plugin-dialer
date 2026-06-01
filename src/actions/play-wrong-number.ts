import type { WrongNumberData } from "../types";
import * as Firebot from "@crowbartools/firebot-types";
import { PLUGIN_ID, FRONTEND_EVENT_PLAY_WRONG_NUMBER } from "../constants";
import { delay } from "../shared";

type PlayWrongNumberEffectData = {
    volume: number;
    audioOutputDevice: Firebot.FirebotAudioDevice;
    overlayInstance: string;
    waitForSound: boolean;
}

const PlayWrongNumberEffect: Firebot.EffectType<
    PlayWrongNumberEffectData,
    WrongNumberData
> = {
    definition: {
        id: `${PLUGIN_ID}:play-wrong-number`,
        name: "Play Wrong Number Tone",
        description: "Play a wrong number tone",
        icon: "fad fa-phone-slash",
        categories: ["fun",  "overlay"]
    },
    optionsController: ($scope) => {
        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
    },
    optionsTemplate: `
        <eos-container header="Settings">
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
                volume: volume
            }, effect.overlayInstance);
        } else {
            Firebot.default.frontendCommunicator.fireEventAsync(FRONTEND_EVENT_PLAY_WRONG_NUMBER, {
                volume: volume,
                audioOutputDevice: effect.audioOutputDevice
            });
        }

        if (effect.waitForSound) {
            await delay(932);
        }

        return true;
    },
    overlayExtension: {
        event: {
            name: `${PLUGIN_ID}:play-wrong-number`,
            onOverlayEvent: async (data) => {
                const audioCtx = new AudioContext();
                const gainNode = new GainNode(audioCtx, { gain: data.volume });
                gainNode.connect(audioCtx.destination);

                async function playSingleTone(tone: number, length: number) {
                    return new Promise((res) => {
                        const oscillator1 = new OscillatorNode(audioCtx, { frequency: tone });

                        oscillator1.connect(gainNode);
                        oscillator1.start();

                        oscillator1.onended = res;

                        oscillator1.stop(audioCtx.currentTime + length / 1000);
                    });
                }

                await playSingleTone(915, 276);
                await playSingleTone(1365, 276);
                await playSingleTone(1765, 380);
            }
        }
    }
}

export default PlayWrongNumberEffect;