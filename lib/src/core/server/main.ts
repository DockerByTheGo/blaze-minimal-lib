
import * as http from "node:http";

import type { CustomWebSocketRouter } from "../websocket/server/app";
import { Router } from "./Router";
import { ClientBuilder } from "../client/client";
import { Config } from "./types/config/Config";
import { GetLastHookReturnType } from "../types/Hooks/GetLastHooks";
import { Hooks } from "../types/Hooks/Hooks";




export class AppBuilder<
    THooks extends {
        beforeHandle: Hooks,
        beforeSend: Hooks,
        afterSend: Hooks,
    },
    TRouter extends Router
> {

    constructor(
        protected hooks: THooks,
        protected router: TRouter,
        protected config: Config
    ) {}

    start(port: Port) {
        
        
    }

    post<TRouteName extends string, THandlerReturn >(args: {
        name: TRouteName,
        handler: (arg: GetLastHookReturnType<THooks["beforeHandle"]>) => THandlerReturn
    }) {
        return this.defineRoute<TRouteName>({
            name: args.name,
            routes: {
                post: args.handler
            }
        })
    }

    get<TRouteName extends string>(args: {
        name: TRouteName,
        handler: (arg: GetLastHookReturnType<THooks["beforeHandle"]>) => unknown
    }) {
        return this.defineRoute<TRouteName>({
            name: args.name,
            routes: {
                get: args.handler
            }
        })
    }

    //TODO: add the rest 

    defineRoute<
    TRouteName extends string,
    >(args: {
        name: TRouteName,
        routes: {
            options?: unknown,
            post?: () => unknown,
            get?: () => unknown,
            put?: () => unknown,
            delete?: () => unknown,
            patch?: () => unknown,
            
        }
    }) {
        return this;
    }



    getClient() {
        return ClientBuilder.new(this.router)
    }

}
