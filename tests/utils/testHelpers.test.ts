import { describe, it, expect, vi } from "vitest";
import {
    createMockHook,
    createIdentityHook,
    createSpyHook,
    createMockRequest,
    assertDefined,
    createMockHandler
} from "./testHelpers";

describe("createMockHook", () => {
    it("should create a hook with name and handler", () => {
        const handler = (x: number) => x * 2;
        const hook = createMockHook("double", handler);

        expect(hook.name).toBe("double");
        expect(hook.handler(5)).toBe(10);
    });
});

describe("createIdentityHook", () => {
    it("should return input unchanged", () => {
        const hook = createIdentityHook("identity");

        expect(hook.name).toBe("identity");
        expect(hook.handler(42)).toBe(42);
        expect(hook.handler("test")).toBe("test");
        expect(hook.handler({ a: 1 })).toEqual({ a: 1 });
    });
});

describe("createSpyHook", () => {
    it("should track calls", () => {
        const spy = createSpyHook("spy");

        spy.hook.handler(1);
        spy.hook.handler(2);
        spy.hook.handler(3);

        expect(spy.getCallCount()).toBe(3);
        expect(spy.getAllCalls()).toEqual([1, 2, 3]);
        expect(spy.getLastCall()).toBe(3);
    });

    it("should pass through values", () => {
        const spy = createSpyHook("passthrough");

        expect(spy.hook.handler(42)).toBe(42);
        expect(spy.hook.handler("test")).toBe("test");
    });

    it("should call onCall callback", () => {
        const callback = vi.fn();
        const spy = createSpyHook("callback", callback);

        spy.hook.handler(10);
        spy.hook.handler(20);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(10);
        expect(callback).toHaveBeenCalledWith(20);
    });

    it("should reset calls", () => {
        const spy = createSpyHook("reset");

        spy.hook.handler(1);
        spy.hook.handler(2);
        expect(spy.getCallCount()).toBe(2);

        spy.reset();
        expect(spy.getCallCount()).toBe(0);
        expect(spy.getAllCalls()).toEqual([]);
    });
});

describe("createMockRequest", () => {
    it("should create request with defaults", () => {
        const request = createMockRequest();

        expect(request.path).toBe("/");
        expect(request.headers).toEqual({});
        expect(request.body).toEqual({});
        expect(request.method).toBe("GET");
    });

    it("should apply overrides", () => {
        const request = createMockRequest({
            path: "/users",
            headers: { "Content-Type": "application/json" },
            body: { name: "John" },
            method: "POST"
        });

        expect(request.path).toBe("/users");
        expect(request.headers).toEqual({ "Content-Type": "application/json" });
        expect(request.body).toEqual({ name: "John" });
        expect(request.method).toBe("POST");
    });

    it("should partially override defaults", () => {
        const request = createMockRequest({
            path: "/api/data"
        });

        expect(request.path).toBe("/api/data");
        expect(request.headers).toEqual({});
        expect(request.body).toEqual({});
        expect(request.method).toBe("GET");
    });
});

describe("assertDefined", () => {
    it("should not throw for defined values", () => {
        expect(() => assertDefined(42)).not.toThrow();
        expect(() => assertDefined("test")).not.toThrow();
        expect(() => assertDefined({})).not.toThrow();
        expect(() => assertDefined([])).not.toThrow();
        expect(() => assertDefined(false)).not.toThrow();
        expect(() => assertDefined(0)).not.toThrow();
    });

    it("should throw for undefined", () => {
        expect(() => assertDefined(undefined)).toThrow("Expected value to be defined");
    });

    it("should throw for null", () => {
        expect(() => assertDefined(null)).toThrow("Expected value to be defined");
    });

    it("should use custom error message", () => {
        expect(() => assertDefined(undefined, "Custom error")).toThrow("Custom error");
    });

    it("should narrow type after assertion", () => {
        const value: string | undefined = "test";
        assertDefined(value);

        // TypeScript should now know value is string
        const length: number = value.length;
        expect(length).toBe(4);
    });
});

describe("createMockHandler", () => {
    it("should track handler calls", () => {
        const mock = createMockHandler((x: number) => x * 2);

        mock.handler(5);
        mock.handler(10);

        expect(mock.getCallCount()).toBe(2);
        expect(mock.getAllCalls()).toEqual([5, 10]);
        expect(mock.getLastCall()).toBe(10);
    });

    it("should execute implementation", () => {
        const mock = createMockHandler((x: string) => x.toUpperCase());

        expect(mock.handler("hello")).toBe("HELLO");
        expect(mock.handler("world")).toBe("WORLD");
    });

    it("should reset calls", () => {
        const mock = createMockHandler((x: number) => x + 1);

        mock.handler(1);
        mock.handler(2);
        expect(mock.getCallCount()).toBe(2);

        mock.reset();
        expect(mock.getCallCount()).toBe(0);
        expect(mock.getAllCalls()).toEqual([]);
    });

    it("should work with complex types", () => {
        interface User {
            id: number;
            name: string;
        }

        const mock = createMockHandler((user: User) => ({
            ...user,
            fullName: user.name.toUpperCase()
        }));

        const result = mock.handler({ id: 1, name: "John" });
        expect(result).toEqual({ id: 1, name: "John", fullName: "JOHN" });
        expect(mock.getLastCall()).toEqual({ id: 1, name: "John" });
    });
});
