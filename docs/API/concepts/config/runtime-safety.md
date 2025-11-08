# Runtime Safety for Locked Options

## Overview

Runtime safety ensures that locked configuration options cannot be modified after they've been set, preventing potential issues that could arise from unauthorized or accidental changes to critical settings.

## How It Works

1. **Initialization Phase**: During application startup, when the app processes all `use` statements
2. **Lock Enforcement**: Any attempt to modify a locked option during this phase will trigger an error
3. **Error Handling**: The framework throws a descriptive error message indicating which option was locked

## Example

```typescript
// First, lock a configuration option
app.use({
  apiKey: { value: 'secret-key-123', isLocked: true }
});

// Later, trying to change the locked option
app.use({
  apiKey: 'new-key'  // This will throw: "Option 'apiKey' is locked, it can't be changed"
});
```

## Error Scenarios

### Attempting to Modify a Locked Option

```typescript
app
  .use({ port: { value: 3000, isLocked: true } })
  .use({ port: 4000 }); // Throws runtime error
```

### Using Lock Helper

```typescript
import { Lock } from '@blazy/utils';

app.use(Lock({
  environment: 'production',
  debug: false
}));

// Any of these would throw an error
app.use({ environment: 'development' });
app.use({ debug: true });
```

## Best Practices

1. **Lock Early**: Apply locks as soon as possible in your application startup
2. **Document Locks**: Add comments explaining why certain options are locked
3. **Test Locking**: Verify that your locked options can't be changed in your test suite
4. **Use Meaningful Errors**: The framework provides clear error messages - make sure they're visible in your logs

## Troubleshooting

If you encounter a locking error:
1. Check where the option was first locked
2. Look for any code that might be trying to modify it
3. Consider if the lock is necessary or if the code trying to change it should be updated

## Next Steps
- Learn about [type safety with locked options](./type-safety.md)
- Review [configuration scopes](../scope.md) for more control over where configurations apply
