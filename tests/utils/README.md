# Test Utilities

This directory contains mock utilities and helpers for testing the backend framework.

## MockRouteMatcher

Flexible mock route matchers for testing routing logic.

### Basic Usage

```typescript
import { mockRoute, MockRouteMatcher } from "../utils";

// Simple exact matching
const matcher = mockRoute("/users");
matcher.match("/users"); // Returns {}
matcher.match("/posts"); // Returns undefined

// With static context
const matcher = mockRoute("/users", { userId: "123" });
matcher.match("/users"); // Returns { userId: "123" }

// With parameter extraction
const matcher = mockRoute("/users/:userId");
matcher.match("/users/123"); // Returns { userId: "123" }

// With dynamic context factory
const matcher = mockRoute("/users/:userId", (path) => ({
    path,
    timestamp: Date.now()
}));
```

### Available Matchers

#### `MockRouteMatcher`
Supports exact matching and parameter extraction (`/users/:userId`).

```typescript
const matcher = new MockRouteMatcher<"/users/:userId", { userId: string }>(
    "/users/:userId"
);
```

#### `ExactMockRouteMatcher`
Only matches exact paths, no parameter extraction.

```typescript
const matcher = new ExactMockRouteMatcher("/users/123", { userId: "123" });
```

#### `AlwaysMatchRouteMatcher`
Always matches regardless of path (useful for fallback testing).

```typescript
const matcher = new AlwaysMatchRouteMatcher("/wildcard", { matched: true });
```

#### `NeverMatchRouteMatcher`
Never matches (useful for testing error handling).

```typescript
const matcher = new NeverMatchRouteMatcher("/never");
```

#### `createCustomMockRouteMatcher`
Create a matcher with custom logic.

```typescript
const matcher = createCustomMockRouteMatcher(
    "/custom",
    (path) => path.startsWith("/api") ? { api: true } : undefined
);
```

## Test Helpers

### Hook Utilities

```typescript
import { createMockHook, createIdentityHook, createSpyHook } from "../utils";

// Create a simple mock hook
const hook = createMockHook("transform", (x) => x * 2);

// Create an identity hook (passes through unchanged)
const passthrough = createIdentityHook("passthrough");

// Create a spy hook to track calls
const spy = createSpyHook("spy", (arg) => {
    console.log("Called with:", arg);
});

spy.hook.handler(42);
console.log(spy.getCallCount()); // 1
console.log(spy.getLastCall()); // 42
spy.reset();
```

### Request Mocking

```typescript
import { createMockRequest } from "../utils";

const request = createMockRequest({
    path: "/api/users",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { name: "John" }
});
```

### Handler Mocking

```typescript
import { createMockHandler } from "../utils";

const mock = createMockHandler((x: number) => x * 2);

mock.handler(5); // Returns 10
console.log(mock.getCallCount()); // 1
console.log(mock.getAllCalls()); // [5]
mock.reset();
```

### Assertions

```typescript
import { assertDefined } from "../utils";

const value: string | undefined = maybeGetValue();
assertDefined(value, "Value must be defined");
// TypeScript now knows value is string, not string | undefined
```

## Example: Complete Test

```typescript
import { describe, it, expect } from "vitest";
import { mockRoute, createSpyHook, createMockRequest } from "../utils";
import { RouterObject } from "../../src/core/server/router/Router";

describe("My Router Tests", () => {
    it("should handle user routes", () => {
        const spy = createSpyHook("logger");
        
        const router = RouterObject
            .empty()
            .beforeHandler(spy.hook)
            .addRoute({
                routeMatcher: mockRoute("/users/:userId"),
                handler: {
                    handleRequest: (ctx) => {
                        return { user: ctx.body.userId };
                    }
                }
            });

        const request = createMockRequest({
            path: "/users/123",
            body: { data: "test" }
        });

        const result = router.route(request);
        
        expect(result).toEqual({ user: "123" });
        expect(spy.getCallCount()).toBe(1);
    });
});
```
