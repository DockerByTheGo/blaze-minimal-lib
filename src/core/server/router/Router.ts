import { RouteMAtcher } from "./routeHandlers/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeHandlers/normal/variations/NormalRouting";
import { Hook, Hooks } from "../../types/Hooks/Hooks";


export type Router = Record<string, RouteHandler>;

type RouteHandlerHooks<TRouterHooks extends RouterLevelHooks> = {
    beforeRequest: (arg: ReturnType<TRouterHooks["beforeRequest"]["TGetLastHook"]>) => unknown,
    afterResponse: (arg: ReturnType<TRouterHooks["afterResponse"]["TGetLastHook"]>) => unknown
}

type RouterLevelHooks = {
    beforeRequest: Hooks<Hook[]>,
    afterResponse: Hooks<Hook[]>

}


class RouterObject<TRouterHooks extends RouterLevelHooks> {
    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn,
        THooks extends RouteHandlerHooks<TRouterHooks>
    >(v: {
        v: TRoouteMAtcher,
        handler: (arg: ReturnType<THooks["beforeRequest"]> & TRoouteMAtcher["TGetContextType"]) => THandlerReturn,
        hooks: THooks
    }){
        return v.hooks
    }
}

const h = new RouterObject()
    .addRoute({
        v: new NormalRouting("/post/:postId"),
        hooks: { //! its importnat to place hooks before handler
            "beforeRequest": arg => {return {koko: "koko"} as const},
            "afterResponse": arg => {return "" as const}
        },
        handler: ctx => {ctx.postId},
    })