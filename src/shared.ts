import type { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class SharedModules {
    private _logger: ScriptModules["logger"];
    private _frontendCommunicator: ScriptModules["frontendCommunicator"];

    setupFirebotModules(modules: ScriptModules) {
        this._logger = modules.logger;
        this._frontendCommunicator = modules.frontendCommunicator;
    }

    get logger() {
        return this._logger;
    }

    get frontendCommunicator() {
        return this._frontendCommunicator;
    }
}

const sharedModules = new SharedModules();

export { sharedModules as SharedModules };