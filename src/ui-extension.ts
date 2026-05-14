import type { FirebotAudioOutputDevice } from "@crowbartools/firebot-custom-scripts-types/types/settings";
import type { UIExtension } from "@crowbartools/firebot-custom-scripts-types/types/modules/ui-extension-manager";
import type { DialNumberData, DialToneData } from "./types";

type FrontendDialNumberData = DialNumberData & {
    audioOutputDevice: FirebotAudioOutputDevice
}

type FrontendDialToneData = DialToneData & {
    audioOutputDevice: FirebotAudioOutputDevice
}

const DialerUIExtension: UIExtension = {
    id: "firebot-dialer-plugin",
    providers: {
        factories: [
            {
                name: "dialer-service",
                function: async (
                    logger: any,
                    backendCommunicator: any,
                    settingsService: any,
                    soundService: any
                ) => {
                    logger.debug("Dialer frontend service loading");

                    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

                    const getSinkId = async (outputDevice: FirebotAudioOutputDevice) => {
                        if (outputDevice == null
                            || outputDevice.label === "App Default"
                        ) {
                            outputDevice = settingsService.getSetting("AudioOutputDevice");
                        }

                        const deviceList: FirebotAudioOutputDevice[] = await soundService.getOutputDevices();

                        const filteredDevice = deviceList.find(d => d.label === outputDevice.label
                            || d.deviceId === outputDevice.deviceId);

                        return filteredDevice?.deviceId ?? "default";
                    }

                    const playTone = async (
                        tone: Array<number>,
                        audioCtx: AudioContext,
                        gainNode: GainNode,
                        toneLength: number
                    ) => {
                            return new Promise((res) => {
                                const oscillator1 = new OscillatorNode(audioCtx, { frequency: tone[0] });
                                const oscillator2 = new OscillatorNode(audioCtx, { frequency: tone[1] });
                            
                                oscillator1.connect(gainNode);
                                oscillator2.connect(gainNode);
                                oscillator1.start();
                                oscillator2.start();
                            
                                oscillator1.onended = res;
                            
                                oscillator1.stop(audioCtx.currentTime + toneLength);
                                oscillator2.stop(audioCtx.currentTime + toneLength);
                            });
                        }

                    backendCommunicator.onAsync("dialer:dial-number", async (data: FrontendDialNumberData) => {
                        // @ts-ignore
                        const audioCtx = new AudioContext({ sinkId: await getSinkId(data.audioOutputDevice) });
                        const gainNode = new GainNode(audioCtx, { gain: data.volume });
                        gainNode.connect(audioCtx.destination);

                        for (let x = 0; x < data.tones.length - 1; x++) {
                            await playTone(data.tones[x], audioCtx, gainNode, data.toneLength / 1000);
                            await delay(data.delayBetween);
                        }
                    
                        await playTone(data.tones[data.tones.length - 1], audioCtx, gainNode, data.toneLength / 1000);
                    });
                    
                    backendCommunicator.onAsync("dialer:play-dial-tone", async (data: FrontendDialToneData) => {
                        // @ts-ignore
                        const audioCtx = new AudioContext({ sinkId: await getSinkId(data.audioOutputDevice) });
                        const gainNode = new GainNode(audioCtx, { gain: data.volume });
                        gainNode.connect(audioCtx.destination);
                            
                        await playTone([350, 440], audioCtx, gainNode, data.toneLength / 1000);
                    });

                    logger.debug("Dialer frontend service loaded");
                }
            }
        ]
    }
}

export default DialerUIExtension;