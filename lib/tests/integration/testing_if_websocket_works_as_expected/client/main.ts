import { Port, WebsocketUrl } from "@blazyts/better-standard-library";

import { router } from "../../../dummmies/app";

const clientBuilder = router.getCLientBuilder(WebsocketUrl.unsafe.withLocalhost(new Port(4000)));
const sender = clientBuilder.generateClient();

sender["channel-1"].puki({
    lolo: "",
});

async function h<T>(a: T) {
    console.log(a);
}

const listener = clientBuilder.setupListeners({
    "channel-1": {
        puki: { handler: h },
    },
    "onError": {
        unprocessableMessage: h,
    },
});

// // throw new Error("")
// const ws = new WebSocket("ws://localhost:4000");

// ws.onopen = () => {
//   console.log("Connected to server");
//   ws.send("Hello from Bun!");
// };

// ws.onmessage = (event) => {
//   console.log("Received:", event.data);
// };

// ws.onclose = () => {
//   console.log("Connection closed");
// };

// ws.onerror = (err) => {
//   console.error("WebSocket error:", err);
// };
