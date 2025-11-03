# Request Lifecycle

## Overview

Understanding the request lifecycle in @blazy/http-core is crucial for building efficient and maintainable applications. This document explains the complete flow of an HTTP request through the framework.

## Lifecycle Phases

1. **Incoming Request**
   - Request is received by the HTTP server
   - Request and response objects are created
   - Global middleware is initialized

2. **Middleware Execution**
   - Global middleware runs in the order it was added
   - Route-specific middleware executes
   - Each middleware can modify the request/response or end the request

3. **Route Matching**
   - The router matches the request URL and method to a route handler
   - Route parameters are extracted and validated
   - Query parameters are parsed

4. **Request Processing**
   - Route handler executes with the request context
   - Business logic is processed
   - Database queries and other I/O operations occur

5. **Response Generation**
   - Response is created with appropriate status code and headers
   - Response body is serialized (if needed)
   - Response is sent to the client

6. **Cleanup**
   - Response is finalized
   - Resources are cleaned up
   - Connection is closed

## Visual Representation

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Incoming      │────>│  Global          │────>│  Route           │
│  Request       │     │  Middleware      │     │  Middleware      │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                 │                        │
                                 ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Route          │<────│  Route           │<────│  Response        │
│  Handler        │     │  Matcher         │     │  Generator       │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Business       │     │  Error           │     │  Response        │
│  Logic          │     │  Handler         │     │  Sent            │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

## Middleware Execution Order

1. Application-level middleware (app.use)
2. Router-level middleware (router.use)
3. Route-level middleware (route.use)
4. Route handler

## Error Handling Flow

1. If an error occurs in any middleware or route handler:
   - The error is caught by the nearest error-handling middleware
   - If no error handler is found, the default error handler is used
   - The error response is sent to the client

## Customizing the Lifecycle

### Adding Global Middleware

```typescript
// Runs for every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

### Error Handling Middleware

```typescript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});
```

### Async/Await Support

```typescript
app.get('/users/:id', async (req) => {
  const user = await userService.getUser(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
});
```

## Performance Considerations

1. **Minimize Synchronous Operations**: Keep synchronous code fast
2. **Use Streams for Large Responses**: For large files or data streams
3. **Cache When Possible**: Cache frequently accessed data
4. **Optimize Database Queries**: Use indexes and efficient queries

## Next Steps
- Learn about [Response Handling](../response-handling/main.md)
- Explore [Performance](../performance/main.md) optimizations
- See [Examples](../examples/main.md) for practical implementations
