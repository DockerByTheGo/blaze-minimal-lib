import type { Extends, FirstArg, ifAny, MemberAlreadyPresent, Or, TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { RequestObjectHelper } from "../../utils/RequestObjectHelper";
import type { IRouteHandler } from "./routeHandler/types";
import type { RouteMAtcher } from "./routeMatcher/types";
import type { Path } from "./utils/path/Path";
import type { Request, Response } from "./routeHandler/types/IRouteHandler";
import { map, TypeError } from "@blazyts/better-standard-library";
import { PathStringToObject } from "./types/PathStringToObject";
import { HandlerHookTypes } from "./routeHandler/hooks/types/HandlerHookReturnTypes";
import { RouterHooks, RouteTree } from "./hooks";
import { RouteHandlerHooks } from "./routeHandler/hooks";


type FilteredTuple<T extends unknown[]> = T extends [infer First, ...infer Rest]
    ? First extends null
    ? FilteredTuple<Rest>
    : First
    : null

type getFromTupleWhichIsntNull<T extends unknown[]> = FilteredTuple<T>

type k = getFromTupleWhichIsntNull<["", null, null]> // should return ""

export class RouterObject<
    TRouterHooks extends RouterHooks,
    TRoutes extends RouteTree,
> {
    constructor(
        public routerHooks: TRouterHooks,
        public routes: TRoutes,
        public routeFinder: (routes: TRoutes, path: Path<string>) => Optionable<((req: Request) => unknown)>,
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
        TRoutes & PathStringToObject<TRoouteMAtcher["TGetRouteString"], THandler>
    // TRoutes & pathStringToObject<TRoouteMAtcher["getRouteString"], {}, THandler["getClientRepresentation"]>
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

    /* the mode is there for easier programatic access so that you do not have to type something like this 
    
    function addHook(v: type){
        app[type] // kinda ugly 
    }
    */
    beforeHandler<
        TName extends string,
        THandler extends (
            arg:
                getFromTupleWhichIsntNull<[
                    Extends<TPlacer, "last", TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]>,
                    Extends<TPlacer, "first", {}>
                ]>
        ) => getFromTupleWhichIsntNull<[
            Extends<TPlacer, "last", URecord>,
            Extends<TPlacer, "first", TRouterHooks["beforeRequest"]["TGetFirstHookArgType"]>
        ]>,
        TPlacer extends HandlerHookTypes[number]
    >(v: {
        name: TName;
        handler: THandler;
        placer: TPlacer,
    },
    ): TName extends TRouterHooks["beforeRequest"]["v"][number]["name"]
        ? MemberAlreadyPresent<"there is a hook with this name already">
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "beforeRequest">
            & {
                beforeRequest: Hooks<getFromTupleWhichIsntNull<[
                    Extends<TPlacer, "first", [Hook<TName, THandler>, ...TRouterHooks["beforeRequest"]["v"]]>,
                    Extends<TPlacer, "last", [...TRouterHooks["beforeRequest"]["v"], Hook<TName, THandler>]>
                ]>>
            },
            TRoutes
        > {

        const updatedHooks = v.placer === "first" ? this.routerHooks.beforeRequest.placeFirst(v) : this.routerHooks.beforeRequest.add(v);

        return new RouterObject(
            {
                ...this.routerHooks,
                beforeRequest: updatedHooks,
            },
            this.routes,
            this.routeFinder
        );

    }

    afterHandler<
        TName extends string,
        THandler extends (
            arg: getFromTupleWhichIsntNull<[
                Extends<TPlacer, "last", TRouterHooks["afterRequest"]["TGetLastHookReturnType"]>,
                Extends<TPlacer, "first", {}>
            ]>
        ) => getFromTupleWhichIsntNull<[
            Extends<TPlacer, "last", URecord>,
            Extends<TPlacer, "first", TRouterHooks["afterRequest"]["TGetFirstHookArgType"]>
        ]>,
        TPlacer extends HandlerHookTypes[number]
    >(v: {
        name: TName;
        handler: THandler;
        placer: TPlacer,
    },
    ): TName extends TRouterHooks["afterRequest"]["v"][number]["name"]
        ? MemberAlreadyPresent<"there is a hook with this name already">
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "afterRequest">
            & {
                afterRequest: Hooks<getFromTupleWhichIsntNull<[
                    Extends<TPlacer, "first", [Hook<TName, THandler>, ...TRouterHooks["afterRequest"]["v"]]>,
                    Extends<TPlacer, "last", [...TRouterHooks["afterRequest"]["v"], Hook<TName, THandler>]>
                ]>>
            },
            TRoutes
        > {

        const updatedHooks = v.placer === "first" ? this.routerHooks.afterRequest.placeFirst(v) : this.routerHooks.afterRequest.add(v);

        return new RouterObject(
            {
                ...this.routerHooks,
                afterRequest: updatedHooks,
            },
            this.routes,
            this.routeFinder
        );
    }

    route(request: RequestObjectHelper<any, any, any>): Response {

        let mutReq = request.createMutableCopy()
        const newReq = map(this.routerHooks.beforeRequest.v.reduce((acc, v) => v.handler(acc), mutReq), v => new RequestObjectHelper(v))

        const reqAfterPerformingHandler = this.routeFinder(this.routes, newReq.path).try({
            ifNone: () => { throw new Error("Route not found") },
            ifNotNone: v => v(newReq)
        })

        // Apply after request hooks
        return this.routerHooks.afterRequest.v.reduce((acc, hook) => hook.handler(acc), reqAfterPerformingHandler)

    }

    static empty() {

        return new RouterObject(
            {
                beforeRequest: Hooks
                    .empty()
                    .add({ name: "transfrom req" as const, handler: (v) => v }),
                afterRequest: Hooks
                    .empty(),
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

}