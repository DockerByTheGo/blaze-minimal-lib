import { RouteMAtcher } from "./routeHandlers/types";
import { RouteHandler } from "../types/router/RouteHandler";
import { NormalRouting } from "./routeHandlers/normal/variations/NormalRouting";

export type Router = Record<string, RouteHandler>;




class RouterObject<Hooks extends []> {
    addRoute<
        TRoouteMAtcher extends RouteMAtcher<unknown>,
        THandlerReturn 
    >(
        v: TRoouteMAtcher,
        handler: (
            arg: 
            // GetLastHookReturnType<Hooks>
             & 
            TRoouteMAtcher["TGetContextType"]) => THandlerReturn
    ){
        
    }
}

new RouterObject()
    .addRoute(
        new NormalRouting("/post/:postId"),
        ctx => {ctx.postId}
    )