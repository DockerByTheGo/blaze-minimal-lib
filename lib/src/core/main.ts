import { Port } from "@blazyts/better-standard-library";

import * as http from "node:http";

import type { CustomWebSocketRouter } from "./websocket/server/app";

export class AppBuilder {
    httpServer: {}; //

    start(port: Port) {
        const server = http.createServer(this.httpServer);
        
    }
}
