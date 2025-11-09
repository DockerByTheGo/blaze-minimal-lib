import { RouteMAtcher } from "./routeHandlers/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeHandlers/normal/variations/NormalRouting";
import { Hook, Hooks } from "../../types/Hooks/Hooks";
import { TypeSafeOmit } from "@blazyts/better-standard-library";


export type Router = Record<string, RouteHandler>;

type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
    beforeRequest: (arg: ReturnType<TRouterHooks["beforeRequest"]["TGetLastHook"]["TGetReturnType"]>) => unknown,
    afterResponse: (arg: ReturnType<TRouterHooks["afterResponse"]["TGetLastHook"]["TGetReturnType"]>) => unknown
}

type RouterHooks = {
    beforeRequest: Hooks<Hook<string, (arg: unknown) => unknown>[]>,
    afterResponse: Hooks<Hook<string, (arg: unknown) => unknown>[]>
}


class RouterObject<
    TRouterHooks extends RouterHooks, 
    TRoutes extends Record<string, RouteHandler>
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
    }

    beforeRequest<
        TName extends string,
        THandler extends (arg: TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]) => unknown
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
        return this.routerHooks.beforeRequest
    }

    routify<TObject extends Record<string, RouteHandler>>(v: TObject){
        
    }

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
            "afterResponse": arg => {return "" as const}
        },
        handler: ctx => {ctx.postId},
    })
    .routify({})