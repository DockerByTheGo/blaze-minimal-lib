import type { And, ifAny, MemberAlreadyPresent, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { RequestObjectHelper } from "../../utils/RequestObjectHelper";
import type { IRouteHandler } from "./routeHandler/types";
import type { RouteMAtcher } from "./routeMatcher/types";
import type { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import type { PathStringToObject } from "./types";
import { Path } from "./utils/path/Path";
import { CleintBuilderConstructors, ClientBuilder } from "../../../../../blazy-edge/src/client/client-builder/clientBuilder";
import type { IRouteHandlerDefault, Response } from "./routeHandler/types/IRouteHandler";
import { catchF, composeCatch, LOG, map, panic, TypeError } from "@blazyts/better-standard-library";

type HookWithThisNameAlreadyExists = MemberAlreadyPresent<"there is a hook with this name already">


export type RouteFinder<TRoutes extends RouteTree> = (routes: TRoutes, path: Path<string>) => Optionable<IRouteHandlerDefault>

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
        And<[
            TRoutes,
            PathStringToObject<TRoouteMAtcher["TGetRouteString"], THandler>
        ]>
    > {
        const routeString = v.routeMatcher.getRouteString();
        const segments = routeString.split("/").filter(s => s !== "");
        const newRoutes = { ...this.routes };
        let current: any = newRoutes;
        // traverse the tree until we get to the last known branch 
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


    route(request: URecord): Response {

        try {
            return map(
                this.routerHooks.beforeHandler.execute(request),
                req => {
                    return this
                        .routeFinder(this.routes, new Path(req.url))
                        .expect("Route not found")
                        .map(handler => { console.log("kkkk", req); const h = handler.handleRequest(req); console.log("handler", handler, h); return h })
                        .map(response => this.routerHooks.afterHandler.execute(response))
                        .map(v => ({ body: v }))
                }
            )

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
        this.routerHooks.afterHandler.add({
            name: name,
            handler: handler,
        });
        return this as any;
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