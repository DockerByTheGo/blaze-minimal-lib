# Hooks

## Overview

Hooks in @blazy/http-core provide a powerful way to intercept and transform data as it flows through your application. They follow a piped architecture, allowing you to create complex data transformation pipelines.

## Key Concepts

- **Piped Architecture**: Each hook's output becomes the next hook's input
- **Lifecycle Awareness**: Hooks can be attached to different points in the application lifecycle
- **Composable**: Combine multiple hooks to create complex behaviors
- **Type-Safe**: Full TypeScript support with proper type inference

## Core Features

1. **Piped Execution**
   - Chain multiple hooks together
   - Each hook processes the output of the previous one
   - Enables complex data transformations

2. **Lifecycle Integration**
   - Attach hooks to specific lifecycle events
   - Example: `beforeRequest`, `afterResponse`, `onError`

3. **Context Sharing**
   - Share data between hooks
   - Access request/response objects
   - Modify the execution flow

## Basic Usage

```typescript
import { createHook } from '@blazy/http-core';

// Create a simple logging hook
const logHook = createHook('log-request', (context, next) => {
  console.log('Request received:', context.request);
  return next(context);
});

// Use the hook in your application
app.use(logHook);
```

## Common Patterns

### Request Validation

```typescript
const validateRequest = createHook('validate-request', (context, next) => {
  if (!context.request.body) {
    throw new Error('Request body is required');
  }
  return next(context);
});
```

### Response Transformation

```typescript
const transformResponse = createHook('transform-response', async (context, next) => {
  const response = await next(context);
  return {
    ...response,
    data: transformData(response.data)
  };
});
```

## Best Practices

1. **Keep Hooks Focused**: Each hook should do one thing well
2. **Handle Errors**: Always handle errors appropriately
3. **Be Mindful of Performance**: Keep synchronous operations fast
4. **Document Your Hooks**: Explain what each hook does and when to use it

## Next Steps
- Learn about [piped hooks](./piped.md)
- Explore [lifecycle hooks](./lifecycle.md)
- See [advanced hook patterns](./advanced.md)
