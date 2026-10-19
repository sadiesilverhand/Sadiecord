import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

interface StatusSuggestion {
    value: string,
    label: () => string,
};

export default definePlugin({
    name: "CustomStatusRecs",
    description: "Sets custom placeholder text in the shitty status setter",
    authors: [
        Devs.sadie
    ],
    getMessages: (): StatusSuggestion[] => {
        const messages = [
            "do it jiggle?",
            "why did you guys break up?",
            "what's the most w fap?",
            "o you have an e621 account?",
            "explode?",
            "do you be meowing?",
            "what if we got naked on a sofa",
            "are you familiar with turtles"
        ];

        const cleaned = messages.map(e => e.replace(/[^a-zA-Z]/g, ""))
        return messages.map((m, i) => ({
            value: cleaned[i].split(" ").slice(0, 4).join(" ").toUpperCase(),
            label: () => m
        })) 
    },
    patches: [
        {
            find: "value:\"FINISHED_PLAYING\",",
            replacement: {
                match: /let (\i)=\[{value:"PLAYING".*}\]/,
                replace: "let $1 = $self.getMessages();"
            }
        }
    ]
})
