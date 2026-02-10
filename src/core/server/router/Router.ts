import type { MemberAlreadyPresent, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { RequestObjectHelper } from "../../utils/RequestObjectHelper";
import type { IRouteHandler } from "./routeHandler/types";
import type { RouteMAtcher } from "./routeMatcher/types";
import type { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import type { Path } from "./utils/path/Path";
import { CleintBuilderConstructors, ClientBuilder } from "../../client/client-builder/clientBuilder";
import type { Request, Response } from "./routeHandler/types/IRouteHandler";
import { TypeError } from "@blazyts/better-standard-library";

type pathStringToObject<T extends string, C, ReturnType = {}> =
    T extends `/${infer CurrentPart}/${infer Rest}`
    ? { [K in CurrentPart]: pathStringToObject<`/${Rest}`, C> }
    : T extends `/${infer Param}`
    ? ReturnType & { [K in Param]: C }
    : ReturnType

// test 

type HookWithThisNameAlreadyExists = MemberAlreadyPresent<"there is a hook with this name already">

type j = pathStringToObject<"/user/:userId/token/:tokenId", {}, 2> // must resolve to {user: {":userId": {token: {":tokenId": string}}}}

export type RouteFinder<TRoutes extends RouteTree> = (routes: TRoutes, path: Path<string>) => Optionable<((req: Request) => unknown)>

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
        THooks extends RouteHandlerHooks<TRouterHooks>,
        THandler extends IRouteHandler<
            { body: TRoouteMAtcher["TGetContextType"] },
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
        current[last] = v.handler;
        return new RouterObject(this.routerHooks, newRoutes, this.routeFinder);
    }



    beforeHandler<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]) => Record<string, unknown>,
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
        const newReq = new RequestObjectHelper(this.routerHooks.beforeHandler.v.reduce((acc, v) => v.handler(acc), mutReq))

        const reqAfterPerformingHandler = this.routeFinder(this.routes, newReq.path).try({
            ifNone: () => { throw new Error("Route not found") },
            ifNotNone: v => v(newReq)
        })

        // Apply after request hooks
        return this.routerHooks.afterHandler.v.reduce((acc, hook) => hook.handler(acc), reqAfterPerformingHandler)

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
                if (typeof current === 'function') {
                    return Optionable.some(current);
                } else if (current && 'handleRequest' in current) {
                    return Optionable.some((req: Request) => current.handleRequest(req));
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
        THandler extends (error: Error) => unknown
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
        THandler extends () => unknown
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
        THandler extends () => unknown
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