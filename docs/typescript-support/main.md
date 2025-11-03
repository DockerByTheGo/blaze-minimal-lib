# TypeScript Support

## Overview

@blazy/http-core is built with TypeScript and provides first-class TypeScript support. This document covers how to leverage TypeScript's type system to build type-safe applications with better developer experience and fewer runtime errors.

## Type Inference

### Route Handlers

```typescript
import { Request, Response } from '@blazy/http-core';

// Request and Response types are automatically inferred
app.get('/users/:id', (req, res) => {
  // req.params is typed as { id: string }
  const userId = req.params.id;
  
  // req.query is typed as Record<string, string | string[]>
  const { page = '1' } = req.query;
  
  // Return type is inferred
  return {
    id: userId,
    name: 'John Doe',
    page: parseInt(page, 10)
  };
});
```

### Request Body Validation

```typescript
import { z } from 'zod';

// Define a schema for the request body
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional()
});

type CreateUserInput = z.infer<typeof createUserSchema>;

app.post('/users', (req: Request<{}, {}, CreateUserInput>) => {
  // req.body is properly typed
  const { name, email, age } = req.body;
  
  // TypeScript knows the types:
  // name: string
  // email: string
  // age: number | undefined
  
  return userService.create({ name, email, age });
});
```

## Custom Type Extensions

### Extending the Request Type

```typescript
// types/express.d.ts
import { User } from '../models/User';

declare module '@blazy/http-core' {
  interface Request {
    // Add custom properties to the request object
    user?: User;
    requestId: string;
    startTime: number;
  }
}

// Now you can use these properties with proper type checking
app.use((req, res, next) => {
  req.requestId = generateId();
  req.startTime = Date.now();
  next();
});
```

## Type-Safe Middleware

```typescript
import { RequestHandler } from '@blazy/http-core';

// Define a type-safe middleware factory
function requireAuth(): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    next();
  };
}

// Usage with proper type checking
app.get('/profile', requireAuth(), (req) => {
  // TypeScript knows req.user is defined here
  return `Welcome, ${req.user.name}!`;
});
```

## Generic Routes

```typescript
import { RouteHandler } from '@blazy/http-core';

// Define a type-safe route handler factory
function createHandler<TParams = {}, TBody = {}, TQuery = {}>(
  handler: RouteHandler<TParams, TBody, TQuery>
): RouteHandler<TParams, TBody, TQuery> {
  return async (req, res, next) => {
    try {
      return await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// Usage with type safety
app.get('/users/:id', createHandler<{ id: string }>((req) => {
  // req.params.id is properly typed as string
  return userService.getUser(req.params.id);
}));
```

## Type-Safe Configuration

```typescript
interface AppConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  database: {
    url: string;
    poolSize: number;
  };
}

// Create a type-safe configuration object
const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  env: process.env.NODE_ENV as AppConfig['env'] || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10')
  }
};

// Use the config with type safety
app.set('config', config);

// Later in your code
const { port } = app.get<AppConfig>('config');
```

## Best Practices

1. **Enable Strict Mode**: Always use TypeScript with `strict: true`
2. **Use Interfaces for Public APIs**: Makes it easier to extend and maintain
3. **Leverage Type Inference**: Let TypeScript infer types when possible
4. **Document Complex Types**: Add JSDoc comments for complex types
5. **Use Type Guards**: For runtime type checking

## Next Steps
- Learn about [Testing](../testing/main.md) your TypeScript code
- Explore [Deployment](../deployment/main.md) options
- See [Examples](../examples/main.md) for practical implementations
