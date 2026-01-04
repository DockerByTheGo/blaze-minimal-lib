// import { expect, expectTypeOf } from "vitest";

import { RouteMAtcher } from "../../../../../src/core/server";
import { RouterObject } from "../../../../../src/core/server/router/Router";
import { RequestObjectHelper } from "../../../../../src/core/utils/RequestObjectHelper";



class NormalRouting<T extends string> implements RouteMAtcher<ExtractParams<T>> {
    type = "normal";

    constructor(private routeString: T) { }

    getRouteString() {
        return this.routeString;
    }

    TGetRouteString: T;

    typeInfo: TypeMarker<string>;

    match(path: string): Optionable<ExtractParams<T>> {
        return this.routeString === path ? this.routeString : undefined;
    }

    TGetContextType: ExtractParams<T>;
}


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
        routeMatcher: {
            match(path: string): Optionable<ExtractParams<T>> {
                return this.routeString === path ? this.routeString : undefined;
            }
        },
        hooks: { // ! its importnat to place hooks before handler
            beforeRequest: (arg) => { return { koko: "koko" } as const; },
            afterResponse: (arg) => { return { koko: "koko" } as const; },
        },
        handler: EnhancedNormalRouteHandler.new(ctx => {

            expectTypeOf(ctx).toEqualTypeOf<{ postId: string }>();
            return {}
        }),
    })
    .addRoute({
        routeMatcher: new NormalRouting("/user/:userId"),
        handler: ctx => { return "userId" },
    })
    .addRoute({
        routeMatcher: new NormalRouting("/simple-route/koko"),
        handler: new FileRouteHandler("./hihi.txt"),
    });

router.routes.post[":postId"]({ "postId": "" })


console.log(router.routes)
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

expect(router.routes).toHaveProperty("simple-route");
expect(router.routes["simple-route"]).toBeInstanceOf(FileRouteHandler);


// test beforeRequestWorkingCorrectly

// ned to test the cleint 