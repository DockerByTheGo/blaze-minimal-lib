# Configuration Scope

## Overview

Configuration scope determines how settings are applied and shared across different parts of your application. In @blazy/http-core, configurations can have different scopes, allowing you to apply a bundle of settings to your app and reuse it as a library.

## Scoping Levels

1. **Global Scope**: Settings applied application-wide
2. **Local Scope**: Settings specific to a particular module or component
3. **Inherited Scope**: Settings that can be inherited and overridden by child components

## Example: Applying Scoped Configuration

```typescript
// Global configuration
app.use({
  // Global settings here
});

// Scoped configuration for a specific module
app.use('/api', {
  // API-specific settings
  config: {
    scope: 'local' // This configuration only applies to the /api route
  }
});
```

## Best Practices

- Use global scope for settings that should apply everywhere
- Use local scope for module-specific customizations
- Be mindful of configuration inheritance to avoid unexpected behavior

## Next Steps
- Learn about [implicit defaults](./implicit-defaults.md)
- Explore [configuration locking](./locking-options.md)
