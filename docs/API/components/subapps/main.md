# Subapps

## Overview

Subapps in @blazy/http-core allow you to organize your application into modular, reusable components. Each subapp can have its own routes, middleware, and configuration, while still being part of the main application.

A component is a plugin that could plug into other instances.

It could be a router, a store, a service, or anything else.

This forces you to break down your application into small pieces, making it easy for you to add or remove features.

think of your subapps less of a router and more like a bundle of operations you have grouped logically and apply to yor app. Although that is not 100% right since apps have their own scope too

## Key Features

- **Modular Architecture**: Break down your application into logical units
- **Isolated Scope**: Each subapp has its own scope by default
- **Composable**: Easily combine and reuse subapps
- **Hierarchical**: Subapps can have their own subapps

## Basic Usage

```typescript
import { Blaze } from "@blazy/http-core";

// Create a subapp
const authApp = new Blaze();

authApp.get("/login", (req) => {
  // Handle login
});

authApp.get("/register", (req) => {
  // Handle registration
});

// Mount the subapp
const mainApp = new Blaze();
mainApp.use("/auth", authApp);
```

## Scoping

By default, subapps are scoped to their mount point:

```typescript
// This route will be available at /api/v1/users
mainApp.use("/api/v1", usersApp);

// This route will be available at /api/v2/users
mainApp.use("/api/v2", usersApp);
```

### Overwriting default scope

to overwrite what the default scope is you can change the `config.defaultScope.set("local" | "global" | "inheriting")`

## Configuration

Each subapp can have its own configuration:

```typescript
const adminApp = new Blaze({
  config: {
    // Subapp-specific configuration
    requireAuth: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
});
```

## Best Practices

1. **Single Responsibility**: Each subapp should have a single responsibility
2. **Encapsulation**: Keep subapp internals private
3. **Reusability**: Design subapps to be reusable across projects
4. **Documentation**: Document each subapp's purpose and API

## Next Steps

- Learn about [App API](../app-api/main.md)
- Explore [Configuration](../config/main.md) options
- See [Examples](../../examples/main.md) for practical implementations
