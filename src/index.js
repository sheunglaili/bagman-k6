import { SocketIO } from "./socketio";

import { sleep } from "k6";
import http from "k6/http"
import { b64encode } from "k6/encoding";

export function setup() {
    const res = http.post(`http://${__ENV.BAGMAN_HOST}/auth/api-key`, JSON.stringify({
        policies: [{
            effect: "allow",
            action: [
                "channel:publish",
                "channel:subscribe",
                "channel:fetch-presence"
            ],
            resource: [
                "channel/*"
            ]
        }]
    }), {
        headers: {
            authorization: `basic ${b64encode('admin:doorman')}`,
            'content-type': 'application/json'
        }
    });

    return res.json();
}

export default async function ({ apiKey }) {
    const io = new SocketIO(__ENV.BAGMAN_HOST);
    await io.connect({ apiKey });
    io.on('error', console.error)

    // io.on("event", console.log)

    await io.sendWithAck("client:subscribe", { channel: "test-channel" });
    for (let i = 0; i < 10; i++) {
        await io.sendWithAck("client:emit", { channel: "test-channel", event: "rapid-fire" });
    }

    sleep(2) // sleep for 2 secs

    io.close();
}