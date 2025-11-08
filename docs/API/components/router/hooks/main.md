
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
  response.setHeader('X-Response-Time', `${duration}ms`);
  response.setHeader('X-Request-Id', context.requestId);
  
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
  if (process.env.NODE_ENV === 'development') {
    await seedDatabase();
  }
  
  logger.info('Application starting...');
});
```

## Route-Specific Hooks

### `beforeHandler` and `afterHandler`

Run before and after individual route handlers.

```typescript
app.get(
  '/users/:id',
  {
    beforeHandler: [
      authenticate,
      authorize('read:user')
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