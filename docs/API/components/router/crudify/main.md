# CRUDify

## Overview

CRUDify is a powerful feature in @blazy/http-core that automatically generates RESTful endpoints for your data models. It follows the principles of Convention Over Configuration to reduce boilerplate code while maintaining flexibility.

## Basic Usage

```typescript
import { crudify } from '@blazy/http-core';

// Define a model
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Create CRUD endpoints
app.use('/users', crudify<User>({
  // Required: Define how to interact with your data store
  async find() {
    // Return all users
    return await db.users.findMany();
  },
  
  async findOne(id: string) {
    // Return a single user by ID
    return await db.users.findUnique({ where: { id } });
  },
  
  async create(data: Omit<User, 'id' | 'createdAt'>) {
    // Create a new user
    return await db.users.create({
      data: {
        ...data,
        id: generateId(),
        createdAt: new Date()
      }
    });
  },
  
  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) {
    // Update an existing user
    return await db.users.update({
      where: { id },
      data
    });
  },
  
  async delete(id: string) {
    // Delete a user
    return await db.users.delete({ where: { id } });
  }
}));
```

## Generated Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | /users | Get all users |
| GET    | /users/:id | Get a single user |
| POST   | /users | Create a new user |
| PUT    | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |

## Advanced Configuration

### Validation

Add input validation using Zod:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // ... other fields
});

app.use('/users', crudify<User>({
  // ... other methods
  
  // Add validation
  validation: {
    create: userSchema,
    update: userSchema.partial()
  }
}));
```

### Custom Middleware

Add middleware to specific routes:

```typescript
app.use('/users', crudify<User>({
  // ... other methods
  
  // Add middleware
  middleware: {
    create: [authenticate, validateRole('admin')],
    update: [authenticate, validateRole('admin')],
    delete: [authenticate, validateRole('admin')],
    find: [cacheMiddleware],
    findOne: [cacheMiddleware]
  }
}));
```

### Custom Query Parameters

Support filtering, sorting, and pagination:

```typescript
// GET /users?name=John&_sort=createdAt&_order=desc&_page=1&_limit=10
app.use('/users', crudify<User>({
  // ... other methods
  
  // Custom query handling
  async find(query: Record<string, any>) {
    const { _page = 1, _limit = 10, _sort, _order, ...filters } = query;
    
    return await db.users.findMany({
      where: filters,
      orderBy: _sort ? { [_sort]: _order || 'asc' } : undefined,
      skip: (_page - 1) * _limit,
      take: _limit
    });
  }
}));
```

## Expose service

this allows you to pass an object and its public methods become endpoints. By default every method is gonna be post and no validation is enforced since there is  no schema to get. If the object implements the ICrudified interface it will be translated to the appropirate http verbs however there is still no validation. Also you can pass the "guess" flag as a scond arg and it will try to guess the metthods from the object (for example if a method has get in the name it will be  a get if it has create it will be post, etc...). To enforce validation you can use our ObjectBuilder builder which allows you to define the type for the arg of a func using a vakidator 


ObjectBuiler.new({docs: ""}).addPrivateProperty("name-of-property", property).addPrivateMethod(internalCtx /*contains name of property, all properties and all previously defined methods*/ => ..., {docs: "idk"}).addPublicMethod("name", z.object({}), ({internalCtx, arg}) => {...}, {docs: "idk"})

this will allows us to safeguard and include validation and even docs for the endppoints