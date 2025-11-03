# Advanced Hook Patterns

## Overview

This document covers advanced patterns and techniques for working with hooks in @blazy/http-core. These patterns can help you build more maintainable and powerful applications.

## 1. Composable Hook Factories

Create reusable hook factories for common patterns:

```typescript
function createAuthHook(requiredRole?: string) {
  return createHook('auth', async (context, next) => {
    const user = await authService.verify(context.request.token);
    
    if (requiredRole && user.role !== requiredRole) {
      throw new Error('Insufficient permissions');
    }
    
    return next({
      ...context,
      user
    });
  });
}

// Usage
app.use(createAuthHook('admin'));
```

## 2. Error Boundary Hooks

Create error boundaries to handle errors in specific parts of your application:

```typescript
function withErrorBoundary(hook) {
  return createHook(`error-boundary-${hook.name}`, async (context, next) => {
    try {
      return await hook(context, next);
    } catch (error) {
      console.error(`Error in ${hook.name}:`, error);
      throw error; // Re-throw or handle as needed
    }
  });
}
```

## 3. Performance Monitoring

Track performance of your hooks:

```typescript
function withMetrics(hook) {
  return createHook(`metrics-${hook.name}`, async (context, next) => {
    const start = process.hrtime();
    const result = await hook(context, next);
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1e6;
    
    metrics.timing(`hook.${hook.name}`, duration);
    return result;
  });
}
```

## 4. Conditional Hook Execution

Dynamically enable/disable hooks based on context:

```typescript
function conditionalHook(condition, hook) {
  return createHook(`conditional-${hook.name}`, (context, next) => {
    if (typeof condition === 'function' ? condition(context) : condition) {
      return hook(context, next);
    }
    return next(context);
  });
}

// Usage
app.use(conditionalHook(
  (ctx) => ctx.request.path.startsWith('/api'),
  someHook
));
```

## 5. Request/Response Transformation

Create reusable transformation hooks:

```typescript
function transformResponse(transformer) {
  return createHook('transform-response', async (context, next) => {
    const response = await next(context);
    return transformer(response);
  });
}

// Usage
app.use(transformResponse((response) => ({
  ...response,
  data: response.data ? JSON.parse(response.data) : null
})));
```

## 6. Caching Layer

Add caching to expensive operations:

```typescript
function withCache(hook, { ttl = 60000 } = {}) {
  const cache = new Map();
  
  return createHook(`cached-${hook.name}`, async (context, next) => {
    const cacheKey = JSON.stringify({
      name: hook.name,
      url: context.request.url,
      // Add other relevant context properties
    });
    
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < ttl) {
      return cached.result;
    }
    
    const result = await hook(context, next);
    cache.set(cacheKey, { result, timestamp: now });
    
    return result;
  });
}
```

## Best Practices

1. **Name Your Hooks**: Always provide meaningful names for better debugging
2. **Handle Errors**: Always implement proper error handling
3. **Document Side Effects**: Clearly document any mutations to the context
4. **Consider Performance**: Be mindful of the performance impact of your hooks
5. **Test Thoroughly**: Write tests for your hooks in isolation

## Next Steps
- Review [piped hooks](./piped.md) for composition patterns
- Explore [lifecycle hooks](./lifecycle.md) for application-wide events
