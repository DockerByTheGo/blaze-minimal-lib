# Error Handling

## Overview

@blazy/http-core provides a comprehensive error handling system that helps you manage and respond to errors in a consistent way throughout your application. This document covers the built-in error classes, error handling middleware, and best practices.

## Built-in Error Classes

### `HttpError`

Base class for all HTTP errors.

```typescript
throw new HttpError(400, 'Invalid input');
```

### Common HTTP Errors

```typescript
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, InternalServerError } from '@blazy/http-core/errors';

// 400 Bad Request
throw new BadRequestError('Invalid email format');

// 401 Unauthorized
throw new UnauthorizedError('Authentication required');

// 403 Forbidden
throw new ForbiddenError('Insufficient permissions');

// 404 Not Found
throw new NotFoundError('User not found');

// 500 Internal Server Error
throw new InternalServerError('Something went wrong');
```

## Custom Error Classes

Create your own error classes:

```typescript
import { HttpError } from '@blazy/http-core/errors';

export class ValidationError extends HttpError {
  constructor(public readonly errors: Record<string, string[]>) {
    super(400, 'Validation failed');
    this.name = 'ValidationError';
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

// Usage
throw new ValidationError({
  email: ['Invalid email format'],
  password: ['Must be at least 8 characters']
});
```

## Error Handling Middleware

### Global Error Handler

```typescript
import { ErrorRequestHandler } from '@blazy/http-core';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error
  console.error(err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // Default error response
  const status = err.status || 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message;
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

app.use(errorHandler);
```

### Async Error Handling

Use `asyncHandler` to automatically catch async errors:

```typescript
import { asyncHandler } from '@blazy/http-core';

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.find(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
}));
```

## Validation Errors

### Using Zod for Validation

```typescript
import { z } from 'zod';
import { validationMiddleware } from '@blazy/http-core/middleware';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).optional()
});

app.post('/users', 
  validationMiddleware({ body: createUserSchema }),
  async (req, res) => {
    // req.body is now validated and typed
    const user = await User.create(req.body);
    res.status(201).json(user);
  }
);
```

## Best Practices

1. **Use Specific Error Types**: Create custom error classes for different error scenarios
2. **Centralized Error Handling**: Use middleware to handle errors consistently
3. **Log Errors**: Always log errors with appropriate context
4. **Don't Leak Sensitive Information**: Be careful with error messages in production
5. **Use Status Codes Correctly**: Follow REST conventions for status codes

## Error Logging

### Structured Logging

```typescript
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    name: err.name,
    stack: err.stack,
    status: err.status,
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    user: req.user?.id
  });
  
  next(err);
});
```

## Next Steps
- Learn about [Lifecycle Hooks](../lifecycle-hooks/main.md)
- Explore [App Scope](../app-scope/main.md)
- See [Examples](../examples/main.md) for practical implementations
