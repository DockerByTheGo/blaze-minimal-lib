import type { ifAny, MemberAlreadyPresent, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { RequestObjectHelper } from "../../utils/RequestObjectHelper";
import type { IRouteHandler } from "./routeHandler/types";
import type { RouteMAtcher } from "./routeMatcher/types";
import type { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import type { Path } from "./utils/path/Path";
import { CleintBuilderConstructors, ClientBuilder } from "../../client/client-builder/clientBuilder";
import type { Request, Response } from "./routeHandler/types/IRouteHandler";
import { catchF, composeCatch, LOG, panic, TypeError } from "@blazyts/better-standard-library";
import { IfAnyThenEmptyObject } from "hono/utils/types";

type pathStringToObject<T extends string, C, ReturnType = {}> =
    T extends `/${infer CurrentPart}/${infer Rest}`
    ? { [K in CurrentPart]: pathStringToObject<`/${Rest}`, C> }
    : T extends `/${infer Param}`
    ? ReturnType & { [K in Param]: C }
    : ReturnType

// test 

type HookWithThisNameAlreadyExists = MemberAlreadyPresent<"there is a hook with this name already">

type j = pathStringToObject<"/user/:userId/token/:tokenId", {}, 2> // must resolve to {user: {":userId": {token: {":tokenId": string}}}}

export type RouteFinder<TRoutes extends RouteTree> = (routes: TRoutes, path: Path<string>) => Optionable<IRouteHandler<any, any>>

export class RouterObject<
    TRouterHooks extends RouterHooks,
    TRoutes extends RouteTree,
> {
    constructor(
        public routerHooks: TRouterHooks,
        public routes: TRoutes,
        public routeFinder: RouteFinder<TRoutes>,
    ) {

    }

    addRoute<
        TRoouteMAtcher extends RouteMAtcher<URecord>,
        THandlerReturn extends Response,
        THooks extends Partial<RouteHandlerHooks<TRouterHooks>>,
        THandler extends IRouteHandler<
            { body: TRoouteMAtcher["TGetContextType"] & (ifAny<ReturnType<THooks["beforeHandler"]>, TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]>) }, // support for adding multiple local hooks in the future 
            THandlerReturn
        >,

    >(v: {
        routeMatcher: TRoouteMAtcher;
        handler: THandler;
        hooks?: THooks;
    },
    ): RouterObject<
        TRouterHooks,
        TRoutes & pathStringToObject<TRoouteMAtcher["TGetRouteString"], THandler>
    > {
        const routeString = v.routeMatcher.getRouteString();
        const segments = routeString.split("/").filter(s => s !== "");
        const newRoutes = { ...this.routes };
        let current: any = newRoutes;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (!current[segment] || (typeof current[segment] === "object" && !("handler" in current[segment]))) {
                current[segment] = {};
            }
            current = current[segment];
        }
        const last = segments[segments.length - 1];
        const modifiedHandler: IRouteHandler<any, any> = {
            ...v.handler,
            handleRequest: arg => catchF(() => v.handler.handleRequest(arg), v.hooks.onError ?? (e => panic(JSON.stringify(e))))
        }

        current[last] = modifiedHandler

        return new RouterObject(this.routerHooks, newRoutes, this.routeFinder);
    }



    beforeHandler<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]) => { path: string },
    >(v: {
        name: TName;
        handler: THandler;
    },
    ):

        TName extends TRouterHooks["beforeHandler"]["v"][number]["name"]
        ? HookWithThisNameAlreadyExists
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "beforeHandler">
            & { beforeHandler: Hooks<[...TRouterHooks["beforeHandler"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {
        this.routerHooks.beforeHandler.add({
            name: v.name,
            handler: v.handler,
        });

        return this

    }

    createClient() {

        return ClientBuilderConstructors.fromRouteTree(this.routes);

    }

    route(request: RequestObjectHelper<any, any, any>): Response {

        let mutReq = request.createMutableCopy()
        try {
            const newReq = new RequestObjectHelper(this.routerHooks.beforeHandler.execute(mutReq))

            console.log("fkkfkfkf")
            const reqAfterPerformingHandler = this
                .routeFinder(this.routes, newReq.path)
                .try({
                    ifNone: () => { throw new Error("Route not found") },
                    ifNotNone: v => {
                        console.log("lpl", v);
                        const result = v.handleRequest(newReq);
                        console.log("ddd", result());
                        return result;
                    }
                })
            console.log("lpll", reqAfterPerformingHandler)

            return this.routerHooks.afterHandler.execute(reqAfterPerformingHandler)
        } catch (e) {
            LOG("error", e)
            return this.routerHooks.onError.execute(e)
        }

    }

    static empty() {

        return new RouterObject(
            {
                beforeHandler: Hooks.empty(),
                afterHandler: Hooks.empty(),
                onError: Hooks.empty(),
                onStartup: Hooks.empty(),
                onShutdown: Hooks.empty(),
            },
            {
            },
            (routes, path) => {
                const segments = path.parts.map(p => p.part);
                let current: any = routes;
                for (const segment of segments) {
                    if (!current || typeof current !== 'object') return Optionable.none();
                    if (current[segment] !== undefined) {
                        current = current[segment];
                        continue;
                    }
                    const paramKey = Object.keys(current).find(k => k.startsWith(':'));
                    if (paramKey) {
                        current = current[paramKey];
                        continue;
                    }
                    return Optionable.none();
                }
                if (current && 'handleRequest' in current) {
                    console.log("f", current)
                    return Optionable.some(current);
                }
                return Optionable.none();
            }

        );

    }

    afterHandler<
        TName extends string,
        THandler extends (arg: TRouterHooks["afterHandler"]["TGetLastHookReturnType"]) => Record<string, unknown>
    >(name: TName, handler: THandler): TName extends TRouterHooks["afterHandler"]["v"][number]["name"]
        ? HookWithThisNameAlreadyExists
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "afterHandler">
            & { afterHandler: Hooks<[...TRouterHooks["afterHandler"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {
        return this
    }

    onError<
        TName extends string,
        THandler extends (arg: TRouterHooks["onError"]["TGetLastHookReturnType"]) => URecord
    >(v: {
        name: TName;
        handler: THandler;
    }): TName extends TRouterHooks["onError"]["v"][number]["name"]
        ? HookWithThisNameAlreadyExists
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "onError">
            & { onError: Hooks<[...TRouterHooks["onError"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {
        this.routerHooks.onError.add({
            name: v.name,
            handler: v.handler,
        });
        return this as any;
    }

    onStartup<
        TName extends string,
        THandler extends (arg: TRouterHooks["onStartup"]["TGetLastHookReturnType"]) => URecord
    >(v: {
        name: TName;
        handler: THandler;
    }): TName extends TRouterHooks["onStartup"]["v"][number]["name"]
        ? HookWithThisNameAlreadyExists
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "onStartup">
            & { onStartup: Hooks<[...TRouterHooks["onStartup"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {
        this.routerHooks.onStartup.add({
            name: v.name,
            handler: v.handler,
        });
        return this as any;
    }

    onShutdown<
        TName extends string,
        THandler extends (arg: TRouterHooks["onShutdown"]["TGetLastHookReturnType"]) => URecord
    >(v: {
        name: TName;
        handler: THandler;
    }): TName extends TRouterHooks["onShutdown"]["v"][number]["name"]
        ? HookWithThisNameAlreadyExists
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "onShutdown">
            & { onShutdown: Hooks<[...TRouterHooks["onShutdown"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {
        this.routerHooks.onShutdown.add({
            name: v.name,
            handler: v.handler,
        });
        return this as any;
    }
}