import { describe, it, expect, expectTypeOf } from "vitest";
import { Optionable } from "@blazyts/better-standard-library";
import { RouteMAtcher } from "../../../../../src/core/server";
import { RouterObject } from "../../../../../src/core/server/router/Router";
import { RequestObjectHelper } from "../../../../../src/core/utils/RequestObjectHelper";
import { MockRouteHandler } from "../../../../utils/MockRouteHandler";

class NormalRouting<T extends string> implements RouteMAtcher<{ postId: string }> {
    type = "normal";

    constructor(private routeString: T) { }

    getRouteString() {
        return this.routeString;
    }

    TGetRouteString: T;

    typeInfo: TypeMarker<"normal">;

    match(path: string): Optionable<{ postId: string }> {
        // Simple parameter extraction for :postId
        const pattern = this.routeString.replace(/:(\w+)/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}$`);
        const match = path.match(regex);

        if (match) {
            return { postId: match[1] };
        }
        return undefined;
    }

    TGetContextType: { postId: string };
}

describe("Router Integration Test", () => {
    it("should execute complete router flow with hooks, handlers, and correct types", () => {
        // Track execution order and calls
        const executionLog: string[] = [];
        let beforeHandler1Called = false;
        let beforeHandler2Called = false;
        let mainHandlerCalled = false;
        let afterHandler1Called = false;
        let afterHandler2Called = false;

        // Capture arguments passed to handlers
        let beforeHandler1Arg: any;
        let beforeHandler2Arg: any;
        let mainHandlerArg: any;
        let afterHandler1Arg: any;
        let afterHandler2Arg: any;

        // Test route matcher
        const routeMatcher = new NormalRouting("/posts/:postId");

        // Verify route matcher types and functionality
        const matchResult = routeMatcher.match("/posts/123");
        expect(matchResult).toBeDefined();
        expect(matchResult?.postId).toBe("123");
        expectTypeOf(matchResult).toEqualTypeOf<{ postId: string } | undefined>();

        // Verify route string
        expect(routeMatcher.getRouteString()).toBe("/posts/:postId");
        expectTypeOf(routeMatcher.TGetRouteString).toEqualTypeOf<"/posts/:postId">();
        expectTypeOf(routeMatcher.TGetContextType).toEqualTypeOf<{ postId: string }>();

        // Build router with all hooks and handlers
        const router = RouterObject
            .empty()
            .beforeHandler({
                name: "add-token",
                handler: arg => {
                    console.log("calling ")
                    beforeHandler1Called = true;
                    beforeHandler1Arg = arg;
                    executionLog.push("beforeHandler1");
                    const result = { ...arg, token: "abc123" } as const;
                    console.log("beforeHandler1 returning:", result);
                    return result;
                },
            })
            .beforeHandler({
                name: "add-user",
                handler: arg => {
                    console.log("beforeHandler2 received:", arg);
                    beforeHandler2Called = true;
                    beforeHandler2Arg = arg;
                    executionLog.push("beforeHandler2");
                    expectTypeOf(arg).toMatchTypeOf<{ token: string }>();
                    const result = { ...arg, userId: 42, userName: "testuser" };
                    console.log("beforeHandler2 returning:", result);
                    return result;
                },
            })
            .addRoute({
                routeMatcher: new NormalRouting("/posts/:postId"),
                hooks: {},
                handler: new MockRouteHandler(req => {
                    mainHandlerCalled = true;
                    mainHandlerArg = req;
                    console.log("ookkokoko")
                    executionLog.push("mainHandler");
                    expectTypeOf(req).toMatchTypeOf<{ body: any }>();
                    return { body: { success: true, postId: req.body?.postId || "unknown", message: "Post retrieved" } };
                })
            })
            .afterHandler("add-timestamp", response => {
                afterHandler1Called = true;
                afterHandler1Arg = response;
                executionLog.push("afterHandler1");
                return { ...response, timestamp: Date.now() } as const;
            })
            .afterHandler("extract-message", response => {
                afterHandler2Called = true;
                afterHandler2Arg = response;
                executionLog.push("afterHandler2");
                expectTypeOf(response).toMatchTypeOf<{ timestamp: number }>();
                expect(response.timestamp).toBeTypeOf("number");
                return response;
            })
            .onError({
                name: "logger", handler: error => {
                    return error
                }
            })
            .onError({ name: "formatter", handler: error => ({ errorCode: "ERR_500" }) })
            .onError({
                name: "extractor", handler: formatted => {
                    expectTypeOf(formatted.errorCode).toMatchTypeOf<{ errorCode: string }>()
                }
            });


        // Execute request through the router
        const request = new RequestObjectHelper({ path: "/posts/999" });
        const response = router.route(request);

        // Verify all handlers were called in correct order
        expect(beforeHandler1Called).toBe(true);
        expect(beforeHandler2Called).toBe(true);
        expect(mainHandlerCalled).toBe(true);
        expect(afterHandler1Called).toBe(true);
        expect(afterHandler2Called).toBe(true);

        // Verify execution order
        expect(executionLog).toEqual([
            "beforeHandler1",
            "beforeHandler2",
            "mainHandler",
            "afterHandler1",
            "afterHandler2"
        ]);

        // Verify beforeHandler chain
        expect(beforeHandler1Arg).toBeDefined();
        expect(beforeHandler2Arg).toBeDefined();
        expect(beforeHandler2Arg.token).toBe("abc123");

        // Verify main handler received proper arguments
        expect(mainHandlerArg).toBeDefined();
        expectTypeOf(mainHandlerArg).toMatchTypeOf<{ body: any }>();

        // Verify afterHandler chain
        expect(afterHandler1Arg).toBeDefined();
        expect(afterHandler2Arg).toBeDefined();
        expect(afterHandler2Arg.timestamp).toBeTypeOf("number");

        // Verify final response
        expect(response).toBeDefined();
        expectTypeOf(response).not.toBeAny();

        // Test route parameter extraction
        const paramTest = routeMatcher.match("/posts/abc-123-def");
        expect(paramTest?.postId).toBe("abc-123-def");

        // Test non-matching route
        const noMatch = routeMatcher.match("/users/123");
        expect(noMatch).toBeUndefined();
    });
});