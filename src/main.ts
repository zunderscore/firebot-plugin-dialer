import { Firebot, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

import {
    PLUGIN_NAME
} from "./constants";

import DialNumberEffect from "./actions/dial-numbers";

const packageInfo = require("../package.json");

let logger: ScriptModules["logger"];
let effectManager: ScriptModules["effectManager"];

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
        ({ logger, effectManager } = modules);

        logInfo(`Starting ${PLUGIN_NAME} plugin...`);

        logDebug("Registering effects...");
        effectManager.registerEffect(DialNumberEffect as Effects.EffectType<unknown>);

        logInfo("Plugin ready.");
    },
    stop: (uninstalling: boolean) => {
        logDebug(`Stopping ${PLUGIN_NAME} plugin`);

        logDebug("Removing effects");
        effectManager.unregisterEffect(DialNumberEffect.definition.id);

        logInfo("Plugin stopped.");
    }
};

export default script;