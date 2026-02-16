import { CleintBuilderConstructors, ClientBuilder } from "../../../../blazy-edge/docs/components/client/client-builder/clientBuilder";
import { Hooks } from "../../../src/core/types/Hooks/Hooks";
import { RouteTree } from "../../../src/core/server/router/types";

// Define a complex route tree for testing
const complexRouteTree = {
    api: {
        users: {
            get: {
                handleRequest: (req: { body: { id: string } }) => ({ body: { user: { id: req.body.id, name: "John Doe" } } }),
                getClientRepresentation: () => ({ method: "GET", path: "/api/users/:id" }),
            },
            list: {
                handleRequest: (req: { body: {} }) => ({ body: { users: [{ id: "1", name: "John" }, { id: "2", name: "Jane" }] } }),
                getClientRepresentation: () => ({ method: "GET", path: "/api/users" }),
            },
            create: {
                handleRequest: (req: { body: { name: string; email: string } }) => ({
                    body: { user: { id: "3", name: req.body.name, email: req.body.email } }
                }),
                getClientRepresentation: () => ({ method: "POST", path: "/api/users" }),
            },
        },
        posts: {
            get: {
                handleRequest: (req: { body: { id: string } }) => ({ body: { post: { id: req.body.id, title: "Sample Post" } } }),
                getClientRepresentation: () => ({ method: "GET", path: "/api/posts/:id" }),
            },
        },
    },
    health: {
        check: {
            handleRequest: (req: { body: {} }) => ({ body: { status: "ok", timestamp: Date.now() } }),
            getClientRepresentation: () => ({ method: "GET", path: "/health" }),
        },
    },
} satisfies RouteTree;

// Create a client builder with the complex route tree
const clientBuilder = CleintBuilderConstructors.fromRouteTree(complexRouteTree);

// Add complex hooks for request/response processing
const clientWithHooks = clientBuilder
    .beforeSend((requestData: any) => {
        console.log("Before send: Adding auth header", requestData);
        return {
            ...requestData,
            headers: {
                ...(requestData.headers || {}),
                Authorization: "Bearer token123",
                "Content-Type": "application/json",
            },
        };
    }, "addAuth")
    .beforeSend((requestData: any) => {
        console.log("Before send: Logging request", requestData);
        return {
            ...requestData,
            logged: true,
        };
    }, "logRequest")
    .beforeSend((requestData: any) => {
        console.log("Before send: Validating request", requestData);
        const headers = requestData.headers || {};
        if (!headers.Authorization) {
            throw new Error("Missing authorization");
        }
        return requestData;
    }, "validateRequest");

// Note: The ClientBuilder.createClient() might not work yet due to constructor mismatch
// This is a demonstration of the intended API

// Example usage of the client (once implemented)
// const client = clientWithHooks.createClient();

// // Send requests using the typed routes
// const userResponse = client.routes.api.users.get.send({ body: { id: "123" } });
// const usersList = client.routes.api.users.list.send({ body: {} });
// const newUser = client.routes.api.users.create.send({ body: { name: "Alice", email: "alice@example.com" } });
// const postResponse = client.routes.api.posts.get.send({ body: { id: "456" } });
// const healthCheck = client.routes.health.check.send({ body: {} });

// Batch requests example
// client.batch({
//   user: client.routes.api.users.get.send({ body: { id: "123" } }),
//   health: client.routes.health.check.send({ body: {} }),
// });

// Error handling example with hooks
const clientWithErrorHandling = clientBuilder
    .beforeSend((requestData: any) => {
        console.log("Error handling: Retrying on failure");
        return requestData;
    }, "retryLogic")
    .beforeSend((requestData: any) => {
        console.log("Error handling: Circuit breaker");
        return requestData;
    }, "circuitBreaker");

// Complex hook chain demonstrating middleware-like behavior
const clientWithMiddleware = clientBuilder
    .beforeSend((data: any) => {
        console.log("Middleware 1: Request start");
        return { ...data, middleware1: true };
    }, "middleware1")
    .beforeSend((data: any) => {
        console.log("Middleware 2: Authentication");
        return { ...data, authenticated: true };
    }, "middleware2")
    .beforeSend((data: any) => {
        console.log("Middleware 3: Rate limiting");
        return { ...data, rateLimited: false };
    }, "middleware3")
    .beforeSend((data: any) => {
        console.log("Middleware 4: Request end");
        return { ...data, processed: true };
    }, "middleware4");

// Type-safe route access demonstration
type ApiRoutes = typeof complexRouteTree.api;
// This ensures type safety for nested routes
const apiRoutes: ApiRoutes = complexRouteTree.api;

// Complex configuration example
const advancedClientBuilder = CleintBuilderConstructors.fromRouteTree(complexRouteTree);

// Custom hooks with complex logic
const clientWithAdvancedHooks = advancedClientBuilder
    .beforeSend((requestData: any) => {
        // Complex request transformation
        const transformed = {
            ...requestData,
            body: {
                ...(requestData.body || {}),
                timestamp: Date.now(),
                version: "1.0",
            },
            metadata: {
                requestId: Math.random().toString(36),
                userAgent: "TestClient/1.0",
            },
        };
        console.log("Advanced transformation applied", transformed);
        return transformed;
    }, "advancedTransform")
    .beforeSend((requestData: any) => {
        // Caching logic
        const body = requestData.body || {};
        const cacheKey = JSON.stringify(body);
        console.log("Checking cache for key:", cacheKey);
        return {
            ...requestData,
            cache: { key: cacheKey, ttl: 300 },
        };
    }, "caching")
    .beforeSend((requestData: any) => {
        // Metrics collection
        console.log("Collecting metrics for request");
        return {
            ...requestData,
            metrics: {
                startTime: Date.now(),
                endpoint: (requestData.url || "unknown"),
            },
        };
    }, "metrics");


clientWithAdvancedHooks.createClient().routes.send()

console.log("Complex client integration test setup complete");
console.log("Route tree structure:", Object.keys(complexRouteTree));
console.log("Available hooks:", Object.keys(clientWithHooks.hooks));