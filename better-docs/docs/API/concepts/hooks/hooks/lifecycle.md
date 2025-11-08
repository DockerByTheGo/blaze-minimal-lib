# Lifecycle Hooks

## Overview

Lifecycle hooks in @blazy/http-core allow you to tap into specific moments in your application's execution flow. These hooks provide a way to execute code at different stages of a request/response cycle, enabling you to manage resources, modify behavior, and handle errors effectively.

## Available Lifecycle Hooks

### 1. Initialization Hooks

```typescript
app.hooks.beforeStart(async () => {
  // Runs once when the application starts
  await database.connect();
});

app.hooks.afterStart(() => {
  console.log('Application started successfully');
});
```

### 2. Request/Response Hooks

```typescript
// Before request is processed
app.hooks.beforeRequest((context) => {
  // Add start time to measure request duration
  context.startTime = Date.now();
});

// After response is generated
app.hooks.afterResponse((context, response) => {
  console.log(`Request took ${Date.now() - context.startTime}ms`);
  return response;
});
```

### 3. Error Handling Hooks

```typescript
app.hooks.onError((error, context) => {
  console.error('Request failed:', {
    url: context.request.url,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  
  // You can modify or rethrow the error
  return error;
});
```

## Hook Execution Order

1. `beforeStart`
2. `beforeRequest`
3. Route-specific middleware
4. Route handler
5. `afterResponse`
6. `onError` (if an error occurs)
7. `afterStart` (only once during application startup)

## Best Practices

1. **Keep Hooks Lightweight**: Avoid heavy computations in hooks
2. **Handle Errors**: Always implement error handling in your hooks
3. **Use Context Wisely**: The context object is shared across all hooks
4. **Document Your Hooks**: Clearly document the purpose and side effects of each hook

## Advanced Usage

### Conditional Hooks

```typescript
app.hooks.beforeRequest((context) => {
  if (context.request.path.startsWith('/api')) {
    // Only apply to API routes
    context.isApiRequest = true;
  }
});
```

### Async Hooks

```typescript
app.hooks.beforeRequest(async (context) => {
  const user = await authService.verifyToken(context.request.token);
  context.user = user;
});
```

## Next Steps
- Learn about [piped hooks](./piped.md)
- Explore [advanced hook patterns](./advanced.md)
