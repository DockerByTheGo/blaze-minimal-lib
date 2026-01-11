// import { expect, expectTypeOf } from "vitest";

import { Optionable } from "@blazyts/better-standard-library";
import { RouteMAtcher } from "../../../../../src/core/server";
import { RouterObject } from "../../../../../src/core/server/router/Router";
import { RequestObjectHelper } from "../../../../../src/core/utils/RequestObjectHelper";



class NormalRouting<T extends string> implements RouteMAtcher<{body: {hi: string}}> {
    type = "normal";

    constructor(private routeString: T) { }

    getRouteString() {
        return this.routeString;
    }

    TGetRouteString: T;

    typeInfo: TypeMarker<string>;

    match(path: string): Optionable<{body: {hi: string}}> {
        return this.routeString === path ? this.routeString : undefined;
    }

    TGetContextType: {body: {hi: string}};
}


const router = RouterObject
    .empty()
    .beforeRequest({
        name: "add-token",
        handler: arg => ({hi: ""} as const),
        placer: "last", // hooks only work with explicit usage 
    })
    .beforeRequest({
        name: "add-user",
        handler: arg => ({ koko: "" }),
        placer: "last"
    })
    .beforeRequest({
        name: "st",
        handler: v => v,
        placer: "last"
    })
    .addRoute({
        routeMatcher: new NormalRouting("/posts/:postId"),
        hooks: {

        },
        handler: {
            "handleRequest": v => v.body.body.hi
        }
    })
    // .addRoute({
    //     routeMatcher: new NormalRouting("/posts/:postId"),
    //     hooks: { // ! its importnat to place hooks before handler
    //         beforeRequest: (arg) => { return { koko: "koko" } as const; },
    //         afterResponse: (arg) => { return { koko: "koko" } as const; },
    //     },
    //     handler: ctx => {

    //         expectTypeOf(ctx).toEqualTypeOf<{ postId: string }>();
    //         return {}
    //     },
    // })
    .addRoute({
        routeMatcher: new NormalRouting("/user/:userId"),
        handler: ctx => { return  },
    })






console.log(
    router.route(new RequestObjectHelper({
        path: "/posts/1",
        headers: {},
        body: {body: {hi: ""}}
    }))
)

expect(router.route(new RequestObjectHelper({
    path: "/user/1",
    headers: {},
    body: {}
})
)).toBe("userId")

// Test that the route tree is built correctly
expect(router.routes).toHaveProperty("post");
expect(router.routes.post).toHaveProperty(":postId");
expect(typeof router.routes.post[":postId"]).toBe("function");

expect(router.routes).toHaveProperty("user");
expect(router.routes.user).toHaveProperty(":userId");
expect(typeof router.routes.user[":userId"]).toBe("function");