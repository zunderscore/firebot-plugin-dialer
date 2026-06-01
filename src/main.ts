import { Plugin } from "@crowbartools/firebot-types";

import { PLUGIN_NAME } from "./constants";

import DialNumberEffect from "./actions/dial-number";
import PlayDialToneEffect from "./actions/play-dial-tone";
import PlayBusySignalEffect from "./actions/play-busy-signal";
import PlayWrongNumberEffect from "./actions/play-wrong-number";
import PlayRingbackToneEffect from "./actions/play-ringback-tone";
import DialerUIExtension from "./ui-extension";

const packageInfo = require("../package.json");

const script: Plugin = {
    manifest: {
        type: "plugin",
        icon: "fa-phone",
        name: PLUGIN_NAME,
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        minimumFirebotVersion: { major: 5, minor: 67 },
        repo: "https://github.com/zunderscore/firebot-plugin-dialer"
    },
    registers: {
        effects: [
            DialNumberEffect,
            PlayDialToneEffect,
            PlayBusySignalEffect,
            PlayWrongNumberEffect,
            PlayRingbackToneEffect
        ],
        uiExtensions: [
            DialerUIExtension
        ]
    }
};

export default script;