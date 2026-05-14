import { Firebot, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

import {
    PLUGIN_NAME
} from "./constants";
import { SharedModules } from "./shared";

import DialNumberEffect from "./actions/dial-numbers";
import PlayDialToneEffect from "./actions/play-dial-tone";
import DialerUIExtension from "./ui-extension";

const packageInfo = require("../package.json");

let logger: ScriptModules["logger"];
let effectManager: ScriptModules["effectManager"];
let uiExtensionManager: ScriptModules["uiExtensionManager"];

const logDebug = (msg: string, ...meta: any[]) => logger.debug(`[${PLUGIN_NAME}] ${msg}`, ...meta);
const logInfo = (msg: string, ...meta: any[]) => logger.info(`[${PLUGIN_NAME}] ${msg}`, ...meta);
const logWarn = (msg: string, ...meta: any[]) => logger.warn(`[${PLUGIN_NAME}] ${msg}`, ...meta);
const logError = (msg: string, ...meta: any[]) => logger.error(`[${PLUGIN_NAME}] ${msg}`, ...meta);

const script: Firebot.CustomScript = {
    getScriptManifest: () => {
        return {
            name: PLUGIN_NAME,
            description: packageInfo.description,
            author: packageInfo.author,
            version: packageInfo.version,
            firebotVersion: "5",
            startupOnly: true
        };
    },
    getDefaultParameters: () => ({}),
    run: ({ modules }) => {
        ({ logger, effectManager, uiExtensionManager } = modules);

        logInfo(`Starting ${PLUGIN_NAME} plugin...`);
        SharedModules.setupFirebotModules(modules);

        logDebug("Registering effects...");
        effectManager.registerEffect(DialNumberEffect as Effects.EffectType<unknown>);
        effectManager.registerEffect(PlayDialToneEffect as Effects.EffectType<unknown>);

        logDebug("Registering UI extension...");
        uiExtensionManager?.registerUIExtension(DialerUIExtension);

        logInfo("Plugin ready.");
    },
    stop: (uninstalling: boolean) => {
        logDebug(`Stopping ${PLUGIN_NAME} plugin`);

        logDebug("Removing effects");
        effectManager.unregisterEffect(DialNumberEffect.definition.id);
        effectManager.unregisterEffect(PlayDialToneEffect.definition.id);

        logInfo("Plugin stopped.");
    }
};

export default script;