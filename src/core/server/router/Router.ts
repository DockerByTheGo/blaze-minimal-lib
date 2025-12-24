import { RouteMAtcher } from "./routeMatcher/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeMatcher/normal/variations/NormalRouting";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { PretifyRecord, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { decode, encode } from "@msgpack/msgpack";
import { ExtractParams } from "./routeMatcher";
import { FileRouteHandler, NormalRouteHandler } from "./routeHandler";
import { IRouteHandler } from "./routeHandler/types";
import { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import { ClientBuilder } from "../../client/client-builder/clientBuilder";
import { Optionable, OptionableString } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Path } from "./utils/path/Path";

export class RouterObject<
    TRouterHooks extends RouterHooks,
    TRoutes extends RouteTree
> {

    constructor(
        public routerHooks: TRouterHooks,
        public routes: TRoutes,
        public routeFinder: (path: Path<string>) => ((req: Request) => unknown)
    ) {

    }

    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn,
        THooks extends RouteHandlerHooks<TRouterHooks>,
        THandler extends ((arg: ReturnType<THooks["beforeRequest"]> & TRoouteMAtcher["TGetContextType"]) => THandlerReturn) | IRouteHandler<{ body: URecord }, { body: URecord }>
    >(v: {
        v: TRoouteMAtcher,
        handler: THandler,
        hooks?: THooks
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

    addRoute2<TRoute extends IRouteHandler<{ body: { koko: string } }, { body: URecord }>>(v: TRoute) {
        return
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

    }

    websocket() {

    }

    http() {

    }


    static empty() {

        return new RouterObject(
            {
                beforeRequest: new Hooks([]),
                afterResponse: new Hooks([])
            },
            {

            }
        )

    }

    createCleint() {

        return ClientBuilder.constructors.fromRouteTree(this.routes)

    }

    route(request) {
        return this.routeFinder(new Path(path))
    }

}


function NormaRouingT<
    T extends RouterObject<RouterHooks, RouteTree>
>(
    handler: (arg: T["routerHooks"]["beforeRequest"]["TGetLastHookReturnType"]) => unknown): NormalRouteHandler<
        T["routerHooks"]["beforeRequest"]["TGetLastHookReturnType"],
        { body: string }
    > {

    return new NormalRouteHandler(handler)

}