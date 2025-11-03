
import * as http from "node:http";

import type { CustomWebSocketRouter } from "../websocket/server/app";
import { ClientBuilder } from "../client/client";
import { Config } from "./types/config/Config";
import { GetLastHookReturnType } from "../types/Hooks/GetLastHooks";
import { Hooks } from "../types/Hooks/Hooks";
import { Router } from "./types/router/Router";

interface Routing {
    type: string,
    isMatching: (path: string) => boolean,
    getRouteString: () => string
}

class NormalRouting implements Routing {
    
    type = "normal";

    constructor(routeString: string){}

    isMatching(path: string) {
        return true; 
    }

    getRouteString(){}

}

class DSLRouting implements Routing {
    
    type = "dsl";

    isMatching(path: string) {

    }

    getRouteString: () => string;
}

class RegexRouting implements Routing {
    
    type = "regex";

    isMatching(path: string) {
        return true; 
    }

    getRouteString(){}
}

export class AppBuilder<
    THooks extends {
        beforeHandle: Hooks,
        beforeSend: Hooks,
        afterSend: Hooks,
    },
    TRouter extends Router
> {

    private constructor(
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


    route()

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

    static new() {
        return new AppBuilder({
            beforeHandle: [],
            beforeSend: [],
            afterSend: [],
        }, new Router(), new Config())
    }



    createClientBuilder() {
        return ClientBuilder.new(this.router)
    }

}
