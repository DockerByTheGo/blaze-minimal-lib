// import { expect, expectTypeOf } from "vitest";

import { FileRouteHandler } from "../../../../../src/core/server/router/routeHandler";
import { NormalRouting } from "../../../../../src/core/server/router/routeMatcher/normal/variations/NormalRouting";
import { RouterObject } from "../../../../../src/core/server/router/Router";

const router = RouterObject
    .empty()
    .beforeRequest({
        name: "add-token",
        handler: arg => "" as const,
    })
    .beforeRequest({
        name: "add-user",
        handler: arg => "" as const,
    })
    .addRoute({
        v: new NormalRouting("/post/:postId"),
        hooks: { // ! its importnat to place hooks before handler
            beforeRequest: (arg) => { return { koko: "koko" } as const; },
            afterResponse: (arg) => { return { koko: "koko" } as const; },
        },
        handler: (ctx) => {
            expectTypeOf(ctx).toEqualTypeOf<{ postId: string }>();
        },
    })
    .addRoute({
        v: new NormalRouting("/user/:userId"),
        handler: (ctx) => { ctx.userId; },
    })
    .addRoute({
        v: new NormalRouting("/simple-route"),
        handler: new FileRouteHandler("./hihi.txt"),
    });


console.log(router.routes)

// Test that the route tree is built correctly
// expect(router.routes).toHaveProperty("post");
// expect(router.routes.post).toHaveProperty(":postId");
// expect(typeof router.routes.post[":postId"]).toBe("function");

// expect(router.routes).toHaveProperty("user");
// expect(router.routes.user).toHaveProperty(":userId");
// expect(typeof router.routes.user[":userId"]).toBe("function");

// expect(router.routes).toHaveProperty("simple-route");
// expect(router.routes["simple-route"]).toBeInstanceOf(FileRouteHandler);