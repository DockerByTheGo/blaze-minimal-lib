this is the the thing which manages all your other services andis responsible for the server

## Creating an Application

```typescript
import { Blaze } from "@blazy/http-core";

const app = new Blaze({
  // Optional configuration
  env: process.env.NODE_ENV || "development",
  port: 3000,
  // ... other options
});
```

### `listen(port?: number, hostname?: string, backlog?: number): Promise<Server>`

Start the server.

```typescript
const server = await app.listen(3000, "0.0.0.0");
console.log("Server started on port 3000");
```

### `close(): Promise<void>`

Gracefully shut down the server.

```typescript
process.on("SIGTERM", async () => {
  await app.close();
  process.exit(0);
});
```

## `addSubApp`

### Hooks

onSubAppAdded(subAppObj => ...)
