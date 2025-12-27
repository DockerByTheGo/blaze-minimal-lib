# App Scope

## Overview

App Scope in @blazy/http-core provides a way to manage the visibility and lifecycle of application state and dependencies. It helps you control how and where your application's resources are shared and accessed.

## Understanding Scopes

### Global Scope

```typescript
// Anywhere in your application
app.set("config", { apiKey: "123" });
const config = app.get("config");
```

### Request Scope

```typescript
app.use((req, res, next) => {
  // Available throughout the request lifecycle
  req.context = {
    requestId: generateId(),
    startTime: Date.now()
  };
  next();
});
```

### Module Scope

```typescript
// services/userService.ts
export const userService = {
  async getUser(id: string) {
    // Module-scoped cache
    if (!this.cache) {
      this.cache = new Map();
    }

    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const user = await db.users.findUnique({ where: { id } });
    this.cache.set(id, user);
    return user;
  }
};
```

## Dependency Injection

### Basic Injection

```typescript
// services/emailService.ts
class EmailService {
  constructor(private readonly config: Config) {}

  async sendWelcomeEmail(user: User) {
    // Use injected config
    return await this.sendEmail({
      to: user.email,
      from: this.config.emailFrom,
      subject: "Welcome!",
      text: `Hello ${user.name}!`
    });
  }
}

// app.ts
const emailService = new EmailService({
  emailFrom: "noreply@example.com"
});

app.set("emailService", emailService);

// In a route handler
app.get("/welcome/:userId", async (req) => {
  const emailService = req.app.get("emailService");
  const user = await userService.getUser(req.params.userId);
  await emailService.sendWelcomeEmail(user);
  return { success: true };
});
```

### Scoped Dependencies

```typescript
// Create a scoped container for each request
app.use((req, res, next) => {
  req.container = new Container();

  // Register request-scoped dependencies
  req.container.register("userRepository", {
    useClass: UserRepository,
    scope: "request"
  });

  next();
});

// In a route handler
app.get("/users/:id", async (req) => {
  // Gets a new instance for each request
  const userRepo = req.container.resolve("userRepository");
  return await userRepo.findById(req.params.id);
});
```

## Context Propagation

### AsyncLocalStorage for Context

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

const context = new AsyncLocalStorage<RequestContext>();

app.use((req, res, next) => {
  const store = {
    requestId: generateId(),
    userId: req.user?.id,
    startTime: Date.now()
  };

  return context.run(store, () => {
    return next();
  });
});

// Access context anywhere in the request chain
function getRequestContext(): RequestContext {
  const store = context.getStore();
  if (!store) {
    throw new Error("No active request context");
  }
  return store;
}

// In any service or middleware
class Logger {
  info(message: string, data?: any) {
    const { requestId, userId } = getRequestContext();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      requestId,
      userId,
      message,
      ...data
    }));
  }
}
```

## Best Practices

1. **Minimize Global State**: Prefer request or module scope over global scope
2. **Use Dependency Injection**: Makes testing and maintenance easier
3. **Clean Up Resources**: Release resources when they're no longer needed
4. **Document Dependencies**: Clearly document what each component depends on
5. **Be Mindful of Memory Leaks**: Especially with long-lived objects

## Next Steps

- Learn about [Jobs](../jobs/main.md) for background processing
- Explore [Router](../router/main.md) for request routing
- See [Examples](../examples/main.md) for practical implementations
