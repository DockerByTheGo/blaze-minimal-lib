import { Port } from "@blazyts/better-standard-library";

import * as http from "node:http";

import type { CustomWebSocketRouter } from "../websocket/server/app";
import { Router } from "./types";




export class AppBuilder<
    THooks extends {
        beforeHandle: unknown[],
        afterSend: unknown[],
    },
    TRouter extends Router
> {
    httpServer: {}; //

    constructor(private hooks: THooks ) {}

    start(port: Port) {
        const server = http.createServer(this.httpServer);
        
    }



}
