# Object Builder

## Overview

The Object Builder is a powerful utility in @blazy/http-core that helps you create and manage complex objects with type safety and validation. It's particularly useful for building request/response objects, DTOs, and configuration objects.

## Basic Usage

```typescript
import { ObjectBuilder } from '@blazy/http-core';

// Create a builder for a User object
const UserBuilder = ObjectBuilder.define({
  // Required string field with validation
  name: {
    type: 'string',
    required: true,
    validate: (value) => value.length > 0 ? null : 'Name cannot be empty'
  },
  
  // Optional number field with default value
  age: {
    type: 'number',
    default: 18
  },
  
  // Nested object
  address: {
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' },
      zip: { type: 'string' }
    }
  },
  
  // Array of strings
  tags: {
    type: 'array',
    items: { type: 'string' },
    default: []
  }
});

// Create a new user
const user = UserBuilder.create({
  name: 'John Doe',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'New York',
    zip: '10001'
  },
  tags: ['admin', 'premium']
});

// Validate the object
const validation = UserBuilder.validate(user);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## Advanced Features

### Type Safety

The builder provides full TypeScript type inference:

```typescript
type User = typeof UserBuilder.Type;
// {
//   name: string;
//   age?: number;
//   address?: {
//     street?: string;
//     city?: string;
//     zip?: string;
//   };
//   tags: string[];
// }
```

### Transformations

Apply transformations to values:

```typescript
const UserBuilder = ObjectBuilder.define({
  email: {
    type: 'string',
    transform: (value: string) => value.toLowerCase().trim()
  },
  
  // Transform on get
  fullName: {
    type: 'computed',
    get: (obj) => `${obj.firstName} ${obj.lastName}`
  }
});
```

### Validation Rules

Define complex validation rules:

```typescript
const PasswordResetBuilder = ObjectBuilder.define({
  password: {
    type: 'string',
    validate: (value) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      return null;
    }
  },
  
  confirmPassword: {
    type: 'string',
    validate: (value, obj) => {
      if (value !== obj.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
});
```

### Immutable Updates

Create new objects with partial updates:

```typescript
const updatedUser = UserBuilder.update(user, {
  age: 31,
  'address.city': 'Los Angeles' // Nested updates using dot notation
});
```

## Best Practices

1. **Reuse Builders**: Define builders once and reuse them
2. **Keep Validations Focused**: Each validation should check one thing
3. **Use Transformations**: Clean and normalize data on input
4. **Leverage TypeScript**: Get the most out of type inference
5. **Document Your Builders**: Explain the purpose and rules of each builder

## Integration with Routes

Use builders with route handlers:

```typescript
import { createRoute } from '@blazy/http-core';

const createUserRoute = createRoute({
  method: 'POST',
  path: '/users',
  // Request body validation
  body: UserBuilder.schema,
  handler: async ({ body }) => {
    // Body is already validated and typed
    const user = await userService.create(body);
    return { status: 201, body: user };
  }
});

app.use(createUserRoute);
```

## Next Steps
- Learn about [CRUDify](../crudify/main.md) for automatic REST endpoints
- Explore [Error Handling](../error-handling/main.md) strategies
- See [Examples](../examples/main.md) for practical implementations
