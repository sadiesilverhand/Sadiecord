import { definePluginSettings } from "@api/Settings";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const Native = VencordNative.pluginHelpers.bindsocket as PluginNative<
    typeof import("./native")
>;

export type BindDef = { [k: string]: string };

let running = false;
let registeredBinds: BindDef = {};

const bindHandler: { [k: string]: () => void } = {
    mute: () => {
        FluxDispatcher.dispatch({ type: "AUDIO_TOGGLE_SELF_MUTE" });
    },
    deaf: () => {
        FluxDispatcher.dispatch({ type: "AUDIO_TOGGLE_SELF_DEAF" });
    },
};

export async function handleLoop() {
    while (running) {
        try {
            const call = await Native.bindLoop();
            if (!running) return;
            bindHandler[call]?.();
        } catch (e) {
            console.error("[bindsocket] loop error", e);
            return;
        }
    }
}

const settings = definePluginSettings({
    keys: {
        multiline: true,
        type: OptionType.STRING,
        description: "binds to use\nFULLY RESTART YOUR CLIENT AFTER CHANGING",
        default: "A:mute\nS:deaf",
    },
    lua: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "are you using the new hypr config format"
    }
});

function cleanup() {
    if (!running) return;
    running = false;
    window.removeEventListener("beforeunload", cleanup);
    window.removeEventListener("pagehide", cleanup);
    Native.stop(registeredBinds);
}

export default definePlugin({
    name: "bindsocket",
    description:
        "a modern implementation of socket based global discord binds on hyprland",
    authors: [Devs.sadie],
    settingsAboutComponent: () => {
        return <Paragraph>Currently available commands: mute deaf</Paragraph>;
    },
    settings,
    start() {
        running = true;
        const obj: BindDef = {};

        settings.store.keys.split("\n").forEach(v => {
            const s = v.split(":");
            if (s.length < 2) return;
            obj[s[0].trim()] = s[1].trim();
        });

        registeredBinds = obj;

        Native.start(registeredBinds, settings.store.lua);
        handleLoop();
    },
    stop() {
        cleanup();
    },
});