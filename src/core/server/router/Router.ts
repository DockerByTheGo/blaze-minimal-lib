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

type j = pathStringToObject<"/user/:userId/token/:tokenId", {}, 2> // must resolve to {user: {":userId": {token: {":tokenId": string}}}}


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
        TRoutes & pathStringToObject<TRoouteMAtcher["TGetRouteString"], THandler>
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

    
    guardReq(schema){}

    mapHandlerReturn(){}

    mapResponse(){}

    beforeRequest<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]) => Record<string, unknown>,
    >(v: {
        name: TName;
        handler: THandler;
    },
    ): TName extends TRouterHooks["beforeRequest"]["v"][number]["name"]
        ? MemberAlreadyPresent<"there is a hook with this name already">
        : RouterObject<
            TypeSafeOmit<TRouterHooks, "beforeRequest">
            & { beforeRequest: Hooks<[...TRouterHooks["beforeRequest"]["v"], Hook<TName, THandler>]> },
            TRoutes
        > {

        this.routerHooks.beforeRequest.add({
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
        const newReq = new RequestObjectHelper(this.routerHooks.beforeRequest.v.reduce((acc, v) => v.handler(acc), mutReq))

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
                beforeRequest: Hooks.empty(),
                afterRequest: Hooks.empty(),
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