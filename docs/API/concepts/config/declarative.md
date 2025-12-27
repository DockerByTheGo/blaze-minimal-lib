# Declarative Configuration

## Overview

Declarative configuration in @blazy/http-core allows you to completely replace the current configuration with a new set of options, rather than merging with existing ones.

## Key Characteristics

- Completely replaces the current configuration
- Provides a clean slate for settings
- Useful when you want to ensure no previous configurations affect the current setup

## Example

```typescript
import { ConfigBuilder } from "@blazy/utils";

// Using the ConfigBuilder (explicit)
app.use(ConfigBuilder.createDeclarative({
  // This will completely replace the current config
  port: 3000,
  environment: "production",
  // All other settings will use their default values
}));

// Shorter form (implicit)
app.use({
  // This will be merged with existing config (imperative)
  logLevel: "debug"
}, { mode: "declarative" });
```

## When to Use

- When you want to ensure a specific configuration state
- When you need to completely reset all settings
- When working with configuration presets or templates

## Important Notes

- Be cautious when using declarative configuration in plugins or libraries, as it may override user settings
- Consider using scoped configurations to limit the scope of declarative changes

## Next Steps

- Learn about [configuration locking](./locking-options.md)
- Explore [imperative configuration](./imperative.md) for partial updates
