### `beforeRequest`

Runs before each request is processed by route handlers.

```typescript
app.hooks.beforeRequest((context) => {
  // Add request start time
  context.startTime = Date.now();

  // Set request ID for tracing
  context.requestId = generateRequestId();

  // Log request
  logger.info({
    method: context.req.method,
    url: context.req.url,
    requestId: context.requestId
  });
});
```

### `afterResponse`

Runs after a response is generated but before it's sent to the client.

```typescript
app.hooks.afterResponse((context, response) => {
  // Calculate response time
  const duration = Date.now() - context.startTime;

  // Log response
  logger.info({
    method: context.req.method,
    url: context.req.url,
    status: response.status,
    duration
  });

  // Add response headers
  response.setHeader("X-Response-Time", `${duration}ms`);
  response.setHeader("X-Request-Id", context.requestId);

  return response;
});
```

## Application Lifecycle Hooks

### `beforeStart`

Runs once when the application starts, before the server begins accepting connections.

```typescript
app.hooks.beforeStart(async () => {
  // Connect to database
  await connectToDatabase();

  // Run migrations
  await runMigrations();

  // Seed initial data
  if (process.env.NODE_ENV === "development") {
    await seedDatabase();
  }

  logger.info("Application starting...");
});
```

## Route-Specific Hooks

### `beforeHandler` and `afterHandler`

Run before and after individual route handlers.

```typescript
app.get(
  "/users/:id",
  {
    beforeHandler: [
      authenticate,
      authorize("read:user")
    ],
    afterHandler: [
      logUserAccess,
      cacheResponse
    ]
  },
  async (req, res) => {
    const user = await User.find(req.params.id);
    return user;
  }
);
```

### beforeStart

runs before the server starts listening for connections

### `afterStart`

Runs after the server has started and is accepting connections.

```typescript
app.hooks.afterStart(() => {
  const { port } = app.address();
  logger.info(`Server running on port ${port}`);

  // Register with service discovery
  if (process.env.NODE_ENV === "production") {
    registerWithServiceDiscovery(port);
  }
});
```

### `beforeShutdown`

Runs when the application is about to shut down.

```typescript
app.hooks.beforeShutdown(async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Close database connections
  await closeDatabaseConnections();

  // Complete any pending requests
  await app.closeConnections();

  logger.info("Cleanup complete");
});
```

### `onError`

Global error handler for uncaught exceptions.

if there is an error that hasnt been handled anywhere else it will be handled here. For example if you do not have a global error handler in router each route which throws an exception which doesnt have a router specific on error handler will go here

```typescript
app.hooks.onError((error, context) => {
  // Log the error
  logger.error({
    error: error.message,
    stack: error.stack,
    requestId: context?.requestId,
    path: context?.req?.url
  });

  // Don't leak internal errors in production
  const isProduction = process.env.NODE_ENV === "production";

  return {
    status: error.status || 500,
    body: {
      error: isProduction ? "Internal Server Error" : error.message,
      ...(!isProduction && { stack: error.stack })
    }
  };
});
```