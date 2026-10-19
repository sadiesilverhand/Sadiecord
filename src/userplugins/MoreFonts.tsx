import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "MoreFonts",
    description: "",
    authors: [ Devs.sadie ],
    getFonts(e): Number[] {
        console.log(e)
        return [1, 2, 3, 4, 5, 6, 7];
    },
    patches: [
        {
            find: "type:\"DISPLAY_NAME_STYLES_MARK_EFFECT_SEEN\",eff",
            replacement: {
                match: /("--custom-dns-tile-columns":.*children:)(\i)\.map/,
                replace: "$1$self.getFonts($2).map"
            }
        }
    ]
})