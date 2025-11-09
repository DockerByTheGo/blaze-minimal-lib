# Locking Configuration Options

## Overview

Configuration locking in @blazy/http-core provides a way to prevent accidental or unauthorized changes to critical configuration settings after they've been set. This is particularly useful in scenarios where changing certain settings at runtime could lead to unexpected behavior or security issues.

## Why Lock Configuration?

- **Prevent Accidental Changes**: Ensure critical settings aren't modified unintentionally
- **Security**: Protect sensitive configuration from being altered at runtime
- **Consistency**: Maintain a predictable application state
- **Debugging**: Make it easier to track where and when configurations are being set

## How to Lock Configuration

### Locking Individual Options

```typescript
app.use({
  database: {
    host: { value: 'localhost', isLocked: true },
    port: 3000  // This remains unlocked and can be changed
  }
});
```

### Locking Entire Configuration

```typescript
import { Lock } from '@blazy/utils';

app.use(Lock({
  // All these settings will be locked
  environment: 'production',
  port: 3000,
  // ...
}));
```

## What Happens When You Try to Modify a Locked Setting?

1. **At Runtime**: If you attempt to change a locked setting during initialization (in a `use` statement), you'll receive an error: `Option 'x' is locked, it can't be changed`

2. **At Compile Time**: If you're using TypeScript, attempting to modify a locked property will result in a type error, as the property will be of type `never`.

## Example: Type Safety with Locked Options

```typescript
app
  .use({ database: { host: { value: 'localhost', isLocked: true } } })
  .use({ database: { host: 'new-host' } }); // TypeScript error: Type 'string' is not assignable to type 'never'
```

## Best Practices

- Lock sensitive configurations as early as possible
- Document which configurations are locked and why
- Consider using environment variables for values that might need to change between environments
- Use locking judiciously - overuse can make testing and debugging more difficult

## Next Steps
- Learn about [runtime safety](./runtime-safety.md)
- Understand [type safety](./type-safety.md) with locked options
- Explore [configuration scopes](../scope.md) for more granular control
