import { URecord } from "@blazyts/better-standard-library"

export interface Route {
    getMetadata: unknown
}

export class WsRoute<TMessages extends URecord, TCalls extends URecord> implements  Route {
    constructor(public path: string, public schema: TMessages, public schema2: TCalls){
    }

    send<TMessage extends keyof TMessages>(v: TMessages[TMessage]): void{
        
    }

    recieve<TCall extends keyof TCalls>(v: TCalls[TCall]): void{
        
    }

    getMetadata() {
        return {type: "websocket"} as const
    }
}


export type RequestType = unknown
export type ResponseType = unknown

export class HttpRoute<TSchema extends {post: (arg: RequestType) => ResponseType}> implements Route {
    constructor(public path: string, public schrma: TSchema){
    }   

    getMetadata(){
            return {type: "http"} as const
    }
}

export type RouteTree = {[segment: string]: RouteTree | Route}


function v<T extends RouteTree>(v: T): T {
    return v
}

const h = v({
    "user": {
        "id": new HttpRoute("/user/:id", {
            post: arg => "" 
        }),
        live: new WsRoute("/user/:id", {
            "create": {koko: ""}
        }, {})
    }
});