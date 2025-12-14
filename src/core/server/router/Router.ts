import { RouteMAtcher } from "./routeMatcher/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeMatcher/normal/variations/NormalRouting";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { PretifyRecord, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { decode, encode } from "@msgpack/msgpack";
import { ExtractParams } from "./routeMatcher";
import { allStatusCodes as HttpStatusCodes } from "@blazyts/http-types"
import { FileRouteHandler, NormalRouteHandler } from "./routeHandler";
import { IRouteHandler } from "./routeHandler/types";
import { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import { ClientBuilder } from "../../client/clientBuilder";

class RouterObject<
    TRouterHooks extends RouterHooks,
    TRoutes extends RouteTree
> {
    constructor(
        public routerHooks: TRouterHooks,
        public routes: TRoutes
    ) { }

    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn,
        THooks extends RouteHandlerHooks<TRouterHooks>,
        THandler extends ((arg: ReturnType<THooks["beforeRequest"]> & TRoouteMAtcher["TGetContextType"]) => THandlerReturn) | IRouteHandler<{ body: URecord }, { body: URecord }>
    >(v: {
        v: TRoouteMAtcher,
        handler: THandler,
        hooks: THooks
    }): RouterObject<
        TRouterHooks,
        TRoutes & Record<string, RouteHandler>
    > {
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
        { beforeRequest: Hooks<[...TRouterHooks["beforeRequest"]["v"], Hook<TName, THandler>]> },
        TRoutes
    > {
        return this.routerHooks.beforeRequest.add({
            name: v.name,
            handler: v.handler
        })
    }

    addRoute2<TRoute extends IRouteHandler<{ body: { koko: string } }, { body: URecord }>>(v:
        TRoute
    ) { }

    routify<TObject extends Record<string, RouteHandler>>(v: TObject) {

    }

    rpc<TSchemaa extends URecord, TName extends string>(v: { schema: TSchemaa, handler: (v: TSchemaa) => unknown, name: TName }) {
        return this.addRoute({
            v: new NormalRouting("/rpc/" + v.name),
            handler: ctx => v.handler(decode(ctx.body)),
            hooks: {
                "beforeRequest": arg => { return { koko: "koko" } as const },
                "afterResponse": arg => { return { koko: "koko" } as const }
            }
        })


        const clientRepresentation = (arg: TSchemaa) => encode(arg)
    }

    websocket() { }

    static empty() {
        return new RouterObject({
            beforeRequest: new Hooks([]),
            afterResponse: new Hooks([])
        })
    }

    createCleint() {
        return ClientBuilder.constructors.fromRouteTree(this.routes)
    }

}

const h = RouterObject
    .empty()
    .addRoute({
        v: new NormalRouting("/post/:postId"),
        hooks: { //! its importnat to place hooks before handler
            "beforeRequest": arg => { return { koko: "koko" } as const },
            "afterResponse": arg => { return { koko: "koko" } as const }
        },
        handler: ctx => { ctx.postId },
    })
    .createCleint().createClient()



    //
    .addRoute({
        v: new NormalRouting("/user/:userId"),
        hooks: {},
        handler: ctx => { ctx.userId }
    })
    .addRoute({
        v: new NormalRouting("/simple-route"),
        hooks: {},
        handler: new FileRouteHandler("./hihi.txt")
    })
    .addRoute2(new NormalRouteHandler(ctx => { return { body: {} } }))