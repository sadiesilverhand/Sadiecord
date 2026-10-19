import { createConnection, Socket } from "net";
import { BindDef } from ".";
import { app } from "electron";

export function restart(_) {
    app.relaunch();
    app.exit(0);
}

function produceSocketPath(id: string): string {
    const valid = ["", "2"];

    if (!valid.includes(id)) {
        console.log("tried to produce invalid socket id path");
        return "";
    }

    const details = [
        process.env.XDG_RUNTIME_DIR,
        process.env.HYPRLAND_INSTANCE_SIGNATURE,
    ];

    details.forEach((d) => {
        if (!d) {
            return "";
        }
    });

    return `${details[0]}/hypr/${details[1]}/.socket${id}.sock`;
}

let sock2: Socket;

const socksig = "bindsock-call";

async function registerBind(k: string, a: string): Promise<void> {
    return new Promise(async (r) => {
        const sock = createConnection({
            path: produceSocketPath(""),
        }).setEncoding("utf-8");
        const command = `/keyword bindrt SUPER SHIFT,${k},event,${socksig}:${a}`;

        console.log(command);

        sock.write(command);

        sock.on("close", (data) => {
            console.log(k, a, "bind sock closed: ", data);
            r();
        });
        sock.on("error", (err) => {
            console.log(k, a, "bind sock errored: ", err);
            r();
        });
    });
}

async function unregisterBind(k: string): Promise<void> {
    return new Promise(async (r) => {
        const sock = createConnection({
            path: produceSocketPath(""),
        }).setEncoding("utf-8");
        const command = `/keyword unbind SUPER SHIFT,${k}`;

        sock.write(command);

        sock.on("close", (data) => {
            r();
        });
        sock.on("error", (err) => {
            r();
        });
    });
}

function registerBinds(b: BindDef) {
    console.log("recieved binds to register", b);

    Promise.all(
        Object.entries(b).map(async (args) => {
            await registerBind(...args);
            console.log("Binded", args[0], "to", args[1]);
        }),
    );
}

let bindQueue: string[] = [];

let resolveLoop: ((call: string) => void) | null;

export function bindLoop(): Promise<string> {
    return new Promise(async (r) => {
        if (bindQueue.length > 0) {
            r(bindQueue.pop() as string);
        } else {
            resolveLoop = (a) => {
                r(a);
                resolveLoop = null;
            };
        }
    });
}

export function start(_, b: BindDef) {
    console.log("hai from bindsocket native");

    const s = produceSocketPath("2");

    if (s === "") {
        console.log("failed to produce socket path");
        return;
    }

    console.log("socket path", s);

    sock2 = createConnection({
        path: s,
    });

    sock2.setEncoding("utf-8");

    sock2.on("data", (dataRaw) => {
        const e = dataRaw.toString();

        e.split("\n").forEach((d) => {
            const [call, arg] = d.split(">>");

            if (call !== "custom") return;

            console.log(d);

            const [s, k] = arg.split(":");

            if (s !== socksig) return;

            console.log(k);

            if (resolveLoop) {
                resolveLoop(k);
            } else {
                bindQueue.push(k);
            }
        });
    });

    // path doesn't need to be evaluated because we already did
    registerBinds(b);

    app.on("before-quit", () => stop(null, b));
}

export function stop(_, b: BindDef) {
    console.log("bai from bindsocket native");

    if (sock2) sock2.destroy();

    Promise.all(
        Object.entries(b).map(async (args) => {
            await unregisterBind(args[0]);
            console.log("Unbinded", args[0], "from", args[1]);
        }),
    );
}