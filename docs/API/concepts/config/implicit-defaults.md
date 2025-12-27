# Implicit Defaults

## Overview

@blazy/http-core follows the principle of "sensible defaults" to reduce boilerplate code while maintaining flexibility. This means all configuration options come with sensible defaults, allowing you to write less code without losing customizability.

## How It Works

1. **Automatic Defaults**: Most configuration options have sensible defaults that work for common use cases
2. **Progressive Enhancement**: Start with minimal configuration and only override what you need
3. **Type Safety**: Defaults are type-safe and validated at compile time

## Example: Using Defaults

```typescript
// With defaults
const app = new Blaze();
// The app will use sensible defaults for all configurations

// With custom configuration
app.use({
  // Only override what you need
  port: 3000,
  environment: "development"
});
```

## Benefits

- **Reduced Boilerplate**: Less code to write and maintain
- **Faster Development**: Get started quickly without configuring everything
- **Consistency**: Standardized behavior across applications
- **Discoverability**: Easy to see what can be configured

## Next Steps

- Learn about [imperative configuration](./imperative.md)
- Explore [declarative configuration](./declarative.md)
