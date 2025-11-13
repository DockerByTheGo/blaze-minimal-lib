import { RouteMAtcher } from "./routeHandlers/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeHandlers/normal/variations/NormalRouting";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { PretifyRecord, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { HttpResponse } from "../../client/types/HttpResponse";
import { decode, encode } from "@msgpack/msgpack";
import { ExtractParams } from "./routeHandlers";

export type RouteTree = {[segment: string]: RouteTree | {post: ((arg: unknown) => HttpResponse)}} 


const h = {
    users: {
        id : {
            post: v => ({status: 200, body: "", headers: {}})
        }
    }
} satisfies RouteTree

export type Schema = {
    Response: URecord,
    Request: {endpoint: string} & URecord
}

export interface Route<TSchema extends Schema, TGetClientRepresentation> {
    schema: TSchema,
    getClientRepresentation: (arg: TSchema) => TGetClientRepresentation,
    handler: (arg: TSchema["Request"]) => TSchema["Response"],
}


export class HttpRoute<TSchema extends Schema, TGetClientRepresentation> implements Route<TSchema, TGetClientRepresentation> {

    schema: TSchema;
    TGetClientRepresentatio0n: ExtractParams<TSchema["Request"]["endpoint"]>
    getClientRepresentation(arg: TSchema): TGetClientRepresentation{
        return arg as unknown as TGetClientRepresentation
    } 

    handler: (arg: TSchema["Request"]) => TSchema["Response"];

    constructor(v: {
        schema: TSchema,
        getClientRepresentation: (arg: TSchema) => TGetClientRepresentation,
        handler: (arg: TSchema["Request"]) => TSchema["Response"]
    }) {
        this.schema = v.schema;
        this.getClientRepresentation = v.getClientRepresentation;
        this.handler = v.handler;
    }

}


type SimpleRoutesr = {[segment: string]: SimpleRoutesr | Route<Schema, unknown>} 


    new HttpRoute({
        "schema": {
            "Request": {
                "endpoint": "/:user/koko" as const, 
                "body": {jiji: ""} as const
            }, 
            "Response": {}
        }, // as const is importnat 
        "getClientRepresentation": arg => arg as ExtractParams<typeof arg.Request.endpoint> as const,
        "handler": arg => { return arg.body.jiji}
    }).getClientRepresentation()

export class MinimalRouter<TRouter extends SimpleRoutesr> {
    constructor(public router: TRouter){

    }


    addRoute<T extends Route<Schema, unknown>>(v: T): MinimalRouter<TRouter & {[segment: T["schema"]["Request"]["endpoint"]]: T}>{
        return new MinimalRouter({...this.router, [v.v]: v})
    }

    addSubRouter<T extends SimpleRoutesr>(v: {
        
    }): MinimalRouter<TRouter & Record<string, T>>{
        return new MinimalRouter({...this.router, [v.v]: v})
    }

    createCleint(): {
        [segment in keyof TRouter]: TRouter[segment] extends Route<Schema, unknown> ? TRouter[segment]["schema"]["Request"]
    }{
        return {}
    }

}

new MinimalRouter({})
    .addRoute(
    )





type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
    beforeRequest: (arg: ReturnType<TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>,
    afterResponse: (arg: ReturnType<TRouterHooks["afterResponse"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>
}

type RouterHooks = {
    beforeRequest: Hooks<Hook<string, (arg: unknown) => unknown>[]>,
    afterResponse: Hooks<Hook<string, (arg: unknown) => unknown>[]>
}


type HttpResponse = {
    status: number
}

type HttpOnlyRoute = {
    Request: {body: URecord},
    Response: HttpResponse 
}

type HttpOnlyRoutes = {[seg: string]: HttpOnlyRoutes | HttpOnlyRoute}

class HttpOnlyRouter<T extends HttpOnlyRoutes>{
    constructor(private v: T){

    }


    post<TName extends string, TBody extends URecord, TResponse extends HttpResponse>(v: {
        path: TName,
        bodySchema: TBody, 
        TResponseSchema?: TResponse // use noInfer
        handler: (arg: TBody) => TResponse
    }){

    }
}




new HttpOnlyRouter({}).post({
    path: "/users/:name",
    bodySchema: {"name": ""},
    TResponseSchema: {name: "", status: 200} as const,
    handler: v => {return {"status": 200, }}
})

class RouterObject<
    TRouterHooks extends RouterHooks, 
    TRoutes extends RouteTree
> {
    constructor(public routerHooks: TRouterHooks){}

    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn,
        THooks extends RouteHandlerHooks<TRouterHooks>
    >(v: {
        v: TRoouteMAtcher,
        handler: (arg: ReturnType<THooks["beforeRequest"]> & TRoouteMAtcher["TGetContextType"]) => THandlerReturn,
        hooks: THooks
    }): RouterObject<
        TRouterHooks,
        TRoutes & Record<string, RouteHandler>
    >{
        return this 
    }

    beforeRequest<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]) => Record<string, unknown>
    >(v: {
        name: TName,
        handler: THandler
    }): RouterObject<
        TypeSafeOmit<TRouterHooks, "beforeRequest">
         & 
        {beforeRequest: Hooks<[...TRouterHooks["beforeRequest"]["v"], Hook<TName, THandler>]>},
        TRoutes
    >
    {
        return this.routerHooks.beforeRequest.add({
            name: v.name,
            handler: v.handler
        })
    }

    addRoute<>

    routify<TObject extends Record<string, RouteHandler>>(v: TObject){
        
    }

    rpc<TSchemaa extends URecord, TName extends string>(v: {schema: TSchemaa, handler: (v:TSchemaa) => unknown, name: TName}) {
        return this.addRoute({
            v: new NormalRouting("/rpc/" + v.name),
            handler: ctx => v.handler(decode(ctx.body)),
            hooks: {
                "beforeRequest": arg => {return {koko: "koko"} as const},
                "afterResponse": arg => {return {koko: "koko"} as const}
            }
        })


        const clientRepresentation = (arg: TSchemaa) => encode(arg)
    }

    websocket(){}

    static empty(){
        return new RouterObject({
            beforeRequest: new Hooks([]),
            afterResponse: new Hooks([])
        })
    }
}

const h =  RouterObject
    .empty()
    .addRoute({
        v: new NormalRouting("/post/:postId"),
        hooks: { //! its importnat to place hooks before handler
            "beforeRequest": arg => {return {koko: "koko"} as const},
            "afterResponse": arg => {return {koko: "koko"} as const}
        },
        handler: ctx => {ctx.postId},
    })
    .routify({})