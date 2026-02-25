if jq -e '.noBundleUpdates == false' /home/$(whoami)/.config/legcord/storage/settings.json >/dev/null; then
    echo 'please enable "no bundle updates" in legcord, then retry!! ^-^'
else
    pnpm buildWeb --dev
    cat ./dist/extension.js > /home/$(whoami)/.config/legcord/equicord.js
    echo "> wrote js result"
    cat ./dist/extension.css > /home/$(whoami)/.config/legcord/equicord.css
    echo "> wrote js css result"
    echo "enjoy :3"
fi