import { Devs } from "@utils/constants";
import definePlugin, { PluginNative, StartAt } from "@utils/types";

const Native = VencordNative.pluginHelpers.Sockscord as PluginNative<typeof import("./native")>;


export default definePlugin({
    name: "Sockscord",
    authors: [
        Devs.sadie
    ],
    description: "proxy",
    startAt: StartAt.DOMContentLoaded,
    start: async () => {
        console.log("wagwan");
        Native.setProxy();
    }
})