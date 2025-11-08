# Piped Hooks

## Overview

Piped hooks are a core concept in @blazy/http-core that allow you to chain multiple hooks together, where the output of one hook becomes the input of the next. This enables you to create sophisticated data transformation pipelines in a clean, maintainable way.

## How Piping Works

1. **Sequential Execution**: Hooks are executed in the order they are defined
2. **Data Flow**: Each hook receives the output of the previous hook
3. **Early Termination**: Any hook can stop the execution chain by not calling `next()`

## Basic Example

```typescript
import { createHook } from '@blazy/http-core';

const addTimestamp = createHook('add-timestamp', (context, next) => {
  return next({
    ...context,
    timestamp: Date.now()
  });
});

const logRequest = createHook('log-request', (context, next) => {
  console.log(`[${context.timestamp}] Request to ${context.request.url}`);
  return next(context);
});

// Create a pipeline
app.use([addTimestamp, logRequest]);
```

## Advanced Piping

### Conditional Execution

```typescript
const adminOnly = createHook('admin-only', (context, next) => {
  if (!context.user?.isAdmin) {
    throw new Error('Admin access required');
  }
  return next(context);
});
```

### Asynchronous Operations

```typescript
const fetchUser = createHook('fetch-user', async (context, next) => {
  const user = await userService.findById(context.request.userId);
  return next({
    ...context,
    user
  });
});
```

## Best Practices

1. **Keep Hooks Small**: Each hook should do one thing well
2. **Handle Errors**: Always handle potential errors
3. **Be Explicit**: Clearly name your hooks to indicate their purpose
4. **Document Side Effects**: If a hook modifies the context, document it

## Common Patterns

### Request Transformation

```typescript
const parseBody = createHook('parse-body', (context, next) => {
  if (context.request.headers['content-type'] === 'application/json') {
    context.request.body = JSON.parse(context.request.body);
  }
  return next(context);
});
```

### Response Transformation

```typescript
const formatResponse = createHook('format-response', async (context, next) => {
  const response = await next(context);
  return {
    status: 'success',
    data: response.data,
    timestamp: new Date().toISOString()
  };
});
```

## Next Steps
- Learn about [lifecycle hooks](./lifecycle.md)
- Explore [advanced hook patterns](./advanced.md)
