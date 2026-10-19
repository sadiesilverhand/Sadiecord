import { session } from "electron"

export async function setProxy() {
    session.fromPartition('persist:something')
        .setProxy({
            proxyRules: 'socks5://192.168.0.85:2094'
        })
}