# Configuration Concept

Configuration in @blazy/http-core is used to change the behavior of how a Blaze application works. It provides a flexible way to customize various aspects of your application's functionality.

## Key Points

- Centralized way to manage application behavior
- Supports both imperative and declarative approaches
- Type-safe configuration options
- Runtime and compile-time safety features

## Basic Usage

```typescript
import { Blaze } from "@blazy/http-core";

const app = new Blaze();

// Configure your application
app.use({
  // Configuration options go here
});
```

## Next Steps

- Learn about [configuration scope](./scope.md)
- Explore [imperative configuration](./imperative.md)
- Understand [declarative configuration](./declarative.md)
