import type { Plugin } from "@crowbartools/firebot-types";

import { PLUGIN_NAME } from "./constants";

import actions from "./actions";
import { DialerUIExtension } from "./ui-extension";

const packageInfo = require("../package.json");

const script: Plugin = {
    manifest: {
        type: "plugin",
        icon: "fa-phone-rotary",
        color: "#CC0000",
        name: PLUGIN_NAME,
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        minimumFirebotVersion: { major: 5, minor: 67 },
        repo: "https://github.com/zunderscore/firebot-plugin-dialer"
    },
    registers: {
        effects: actions,
        uiExtensions: [
            DialerUIExtension
        ]
    }
};

export default script;