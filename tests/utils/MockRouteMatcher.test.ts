import { describe, it, expect } from "vitest";
import {
    MockRouteMatcher,
    ExactMockRouteMatcher,
    AlwaysMatchRouteMatcher,
    NeverMatchRouteMatcher,
    createCustomMockRouteMatcher,
    mockRoute
} from "./MockRouteMatcher";

describe("MockRouteMatcher", () => {
    describe("exact matching", () => {
        it("should match exact paths", () => {
            const matcher = new MockRouteMatcher("/users");

            expect(matcher.match("/users")).toBeDefined();
            expect(matcher.match("/posts")).toBeUndefined();
        });

        it("should return context from factory for exact match", () => {
            const matcher = new MockRouteMatcher(
                "/users",
                () => ({ userId: "123" })
            );

            const result = matcher.match("/users");
            expect(result).toEqual({ userId: "123" });
        });
    });

    describe("parameter matching", () => {
        it("should extract single path parameter", () => {
            const matcher = new MockRouteMatcher<"/users/:userId", { userId: string }>(
                "/users/:userId"
            );

            const result = matcher.match("/users/123");
            expect(result).toEqual({ userId: "123" });
        });

        it("should extract multiple path parameters", () => {
            const matcher = new MockRouteMatcher<
                "/posts/:postId/comments/:commentId",
                { postId: string; commentId: string }
            >("/posts/:postId/comments/:commentId");

            const result = matcher.match("/posts/42/comments/99");
            expect(result).toEqual({ postId: "42", commentId: "99" });
        });

        it("should not match if path structure differs", () => {
            const matcher = new MockRouteMatcher("/users/:userId");

            expect(matcher.match("/users")).toBeUndefined();
            expect(matcher.match("/users/123/extra")).toBeUndefined();
        });

        it("should merge factory context with extracted params", () => {
            const matcher = new MockRouteMatcher(
                "/users/:userId",
                () => ({ timestamp: Date.now() })
            );

            const result = matcher.match("/users/123");
            expect(result).toHaveProperty("userId", "123");
            expect(result).toHaveProperty("timestamp");
        });
    });

    describe("getRouteString", () => {
        it("should return the route string", () => {
            const matcher = new MockRouteMatcher("/api/users");
            expect(matcher.getRouteString()).toBe("/api/users");
        });
    });
});

describe("ExactMockRouteMatcher", () => {
    it("should only match exact paths", () => {
        const matcher = new ExactMockRouteMatcher(
            "/users/123",
            { userId: "123" }
        );

        expect(matcher.match("/users/123")).toEqual({ userId: "123" });
        expect(matcher.match("/users/456")).toBeUndefined();
    });

    it("should return the same context object", () => {
        const context = { data: "test" };
        const matcher = new ExactMockRouteMatcher("/test", context);

        expect(matcher.match("/test")).toBe(context);
    });
});

describe("AlwaysMatchRouteMatcher", () => {
    it("should match any path", () => {
        const matcher = new AlwaysMatchRouteMatcher(
            "/wildcard",
            { matched: true }
        );

        expect(matcher.match("/anything")).toEqual({ matched: true });
        expect(matcher.match("/something/else")).toEqual({ matched: true });
        expect(matcher.match("")).toEqual({ matched: true });
    });
});

describe("NeverMatchRouteMatcher", () => {
    it("should never match any path", () => {
        const matcher = new NeverMatchRouteMatcher("/never");

        expect(matcher.match("/never")).toBeUndefined();
        expect(matcher.match("/anything")).toBeUndefined();
    });
});

describe("createCustomMockRouteMatcher", () => {
    it("should create a matcher with custom logic", () => {
        const matcher = createCustomMockRouteMatcher(
            "/custom",
            (path) => path.startsWith("/api") ? { api: true } : undefined
        );

        expect(matcher.match("/api/users")).toEqual({ api: true });
        expect(matcher.match("/users")).toBeUndefined();
    });

    it("should preserve route string", () => {
        const matcher = createCustomMockRouteMatcher(
            "/test",
            () => ({})
        );

        expect(matcher.getRouteString()).toBe("/test");
    });
});

describe("mockRoute helper", () => {
    it("should create a MockRouteMatcher with no context", () => {
        const matcher = mockRoute("/users");

        expect(matcher.match("/users")).toBeDefined();
        expect(matcher.getRouteString()).toBe("/users");
    });

    it("should create an ExactMockRouteMatcher with object context", () => {
        const context = { userId: "123" };
        const matcher = mockRoute("/users", context);

        expect(matcher.match("/users")).toEqual(context);
    });

    it("should create a MockRouteMatcher with factory function", () => {
        const matcher = mockRoute("/users/:userId", (path) => ({
            path,
            timestamp: Date.now()
        }));

        const result = matcher.match("/users/123");
        expect(result).toHaveProperty("userId", "123");
        expect(result).toHaveProperty("path", "/users/123");
        expect(result).toHaveProperty("timestamp");
    });

    it("should handle parameter extraction in mockRoute", () => {
        const matcher = mockRoute("/posts/:postId");

        const result = matcher.match("/posts/42");
        expect(result).toEqual({ postId: "42" });
    });
});
