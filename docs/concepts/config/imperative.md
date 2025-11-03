# Imperative Configuration

## Overview

Imperative configuration in @blazy/http-core allows you to modify only the specific settings you need while preserving all other default values. This is the default approach when adding configuration.

## How It Works

- Only the specified options are updated
- All other options retain their current values
- Multiple configuration calls are merged together

## Example

```typescript
import { ConfigBuilder } from "@blazy/utils";

// Using the ConfigBuilder (explicit)
app.use(ConfigBuilder.createImperative({
  // Only override what you need
  port: 3000,
  environment: 'development'
}));

// Shorthand (implicit)
app.use({
  // These settings will be merged with existing ones
  logLevel: 'debug'
});
```

## When to Use

- When you only need to change a few settings
- When you want to build configuration incrementally
- When you want to maintain existing defaults for other settings

## Next Steps
- Learn about [declarative configuration](./declarative.md)
- Explore [configuration locking](./locking-options.md)
