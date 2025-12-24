import { NormalRouting } from "../../../../../src/core/server/router/routeMatcher/normal/variations/NormalRouting"
import { RouterObject } from "../../../../../src/core/server/router/Router"
import {expectTypeOf} from "vitest"

const h = RouterObject
    .empty()
    .beforeRequest({
        name: "add-token",
        handler: arg => "" as const;
    })
    .beforeRequest({
        name: "add-user",
        handler
    })
    .addRoute({
        v: new NormalRouting("/post/:postId"),
        hooks: { //! its importnat to place hooks before handler
            "beforeRequest": arg => { return { koko: "koko" } as const },
            "afterResponse": arg => { return { koko: "koko" } as const }
        },
        handler: ctx => {
            
            expectTypeOf(ctx).toEqualTypeOf<{postId: string}>()
        },
    })
    .addRoute({
        v: new NormalRouting("/user/:userId"),
        handler: ctx => { ctx.userId }
    })
    .addRoute({
        v: new NormalRouting("/simple-route"),
        handler: new FileRouteHandler("./hihi.txt")
    })