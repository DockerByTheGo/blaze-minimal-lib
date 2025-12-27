import type { TypeSafeOmit, URecord } from "@blazyts/better-standard-library";
import type { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import type { RequestObjectHelper } from "../../utils/RequestObjectHelper";
import type { RouteHandler } from "../types/router/RouteHandler";
import type { IRouteHandler } from "./routeHandler/types";
import type { RouteMAtcher } from "./routeMatcher/types";
import type { RouteHandlerHooks, RouterHooks, RouteTree } from "./types";
import type { Path } from "./utils/path/Path";
import { ClientBuilder } from "../../client/client-builder/clientBuilder";

export class RouterObject<
    TRouterHooks extends RouterHooks,
    TRoutes extends RouteTree,
> {
    constructor(
        public routerHooks: TRouterHooks,
        public routes: TRoutes,
        public routeFinder: (path: Path<string>) => Optionable<((req: Request) => unknown)>, // implement the route funder
    ) {

    }

    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn,
        THooks extends RouteHandlerHooks<TRouterHooks>,
        THandler extends ((arg: ReturnType<THooks["beforeRequest"]> & TRoouteMAtcher["TGetContextType"]) => THandlerReturn) | IRouteHandler<{ body: URecord }, { body: URecord }>,
    >(v: {
        v: TRoouteMAtcher;
        handler: THandler;
        hooks?: THooks;
    },
    ): RouterObject<
        TRouterHooks,
        TRoutes & Record<string, RouteHandler>
    > {
        const routeString = v.v.getRouteString();
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

    beforeRequest<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]) => Record<string, unknown>,
    >(v: {
        name: TName;
        handler: THandler;
    },
    ): RouterObject<
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

    addRoute2<TRoute extends IRouteHandler<{ body: { koko: string } }, { body: URecord }>>(v: TRoute) {

    }

    createCleint() {

        return ClientBuilder.fromRouteTree(this.routes);

    }

    route(request: RequestObjectHelper<any, any, any>) {

        return this.routeFinder(request.path);

    }

    static empty() {

        return new RouterObject(
            {
                beforeRequest: Hooks.empty(),
                afterResponse: Hooks.empty(),
            },
            {
            },
            () => { }

        );

    }

}