# Type Safety with Locked Options

## Overview

@blazy/http-core leverages TypeScript's type system to provide compile-time safety for locked configuration options. This means you'll catch potential issues with locked options during development, before your code even runs.

## How It Works

When you lock a configuration option:

1. The type of the locked property becomes `never`
2. Any attempt to modify it will result in a TypeScript error
3. You get immediate feedback in your IDE about the issue

## Example

```typescript
// Lock a configuration option
app.use({
  apiKey: { value: 'secret', isLocked: true }
});

// TypeScript will prevent this at compile time
app.use({
  apiKey: 'new-secret'  // Error: Type 'string' is not assignable to type 'never'
});
```

## Benefits of Type Safety

1. **Early Detection**: Catch issues during development
2. **Better Developer Experience**: Get immediate feedback in your IDE
3. **Self-Documenting**: The types clearly indicate which options are locked
4. **Refactoring Support**: TypeScript will help you find all places that need updating

## Advanced Usage

### Conditional Logic with Locked Options

```typescript
const config = {
  environment: { value: 'production' as const, isLocked: true }
};

app.use(config);

// TypeScript knows this is 'production' and it's locked
if (config.environment.value === 'production') {
  // This is type-safe
}
```

### Type Inference

```typescript
// TypeScript infers the exact literal type
app.use({
  logLevel: { value: 'debug' as const, isLocked: true }
});

// This would be a type error
app.use({
  logLevel: 'verbose'  // Error: Type '"verbose"' is not assignable to type 'never'
});
```

## Best Practices

1. **Use `as const`** for literal types to get the most precise type checking
2. **Lock early** to prevent accidental modifications
3. **Document** why certain options are locked
4. **Test** your configuration in development to catch type errors early

## Next Steps
- Learn about [runtime safety for locked options](./runtime-safety.md)
- Explore [configuration scopes](../scope.md) for more control over configurations
