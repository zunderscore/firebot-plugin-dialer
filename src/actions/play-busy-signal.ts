import type { BusySignalData } from "../types";
import * as Firebot from "@crowbartools/firebot-types";
import { PLUGIN_ID, FRONTEND_EVENT_PLAY_BUSY_SIGNAL } from "../constants";
import { delay } from "../shared";

type PlayBusySignalEffectData = {
    count: number;
    fastBusy: boolean;
    volume: number;
    audioOutputDevice: Firebot.FirebotAudioDevice;
    overlayInstance: string;
    waitForSound: boolean;
}

const PlayBusySignalEffect: Firebot.EffectType<
    PlayBusySignalEffectData,
    BusySignalData
> = {
    definition: {
        id: `${PLUGIN_ID}:play-busy-signal`,
        name: "Play Busy Signal",
        description: "Plays a busy signal",
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
            <firebot-input
                input-title="Number of times to play"
                model="effect.count"
                placeholder-text="Example: 2"
                style="margin-bottom: 2rem;" />
            <firebot-checkbox
                model="effect.fastBusy"
                label="Fast busy"
                tooltip="Play a fast busy signal (sometimes called a reorder or congestion tone)."
            />
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
        const fastBusy = !!effect.fastBusy;
        const duration = fastBusy ? 250 : 500;
        const volume = effect.volume / 10;
        const totalDuation = (count * duration * 2) - duration;

        if (effect.audioOutputDevice.deviceId === "overlay") {
            sendDataToOverlay({
                count: count,
                fastBusy: fastBusy,
                volume: volume
            }, effect.overlayInstance);
        } else {
            Firebot.default.frontendCommunicator.fireEventAsync(FRONTEND_EVENT_PLAY_BUSY_SIGNAL, {
                count: count,
                fastBusy: fastBusy,
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
            name: `${PLUGIN_ID}:play-busy-signal`,
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

                        oscillator1.stop(audioCtx.currentTime + ((data.fastBusy ? 250 : 500) / 1000));
                        oscillator2.stop(audioCtx.currentTime + ((data.fastBusy ? 250 : 500) / 1000));
                    });
                }

                for (let x = 0; x < data.count - 1; x++) {
                    await playTone([480, 620]);
                    await delay(data.fastBusy ? 250 : 500);
                }

                await playTone([480, 620]);
            }
        }
    }
}

export default PlayBusySignalEffect;