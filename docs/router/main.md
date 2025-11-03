# Router

## Overview

The Router in @blazy/http-core provides a powerful and flexible way to handle HTTP requests. It supports route parameters, middleware, and route groups, making it easy to organize your application's endpoints.

## Route Resolution 

### regex for path params
You can define a regex for path param and the handler will run when the regex is met in a request

### customRedolver for path params


You can also use the CustomResolver to define a path param logic


```ts
app
.get(new Path()
	.addParam("id", c => or(
		c.isNjmber().below(100),
		c.isString().contains("somwthing")
		) 
	)
)

```


Note this takes the least priority from all routes

#### Priority

This is how the router decides where a request should go if it is matched by multiple requests

It follows this order
1. Static ones
2. Dynamic witth custom resolvers
3. Dynamic

##### overwriting

If you want to override this order for some reason yoi can pass the priority flag and set a value of 1 2 3 and it will be trested as if it is ij the selcted group. And if you want to be the first ine in a certain group also pass the befirst flag. When passed it will take priority within its group, for example if multiple requests within group one match a request the one with beFirst will executed. 

Note that these options should be avoided since they slow the router dramatically

If no priority is given in a group it gets the first one that matches and they are in order of adding

For example
```ts
app.get('/:id')
app.get('/:otber')

// A call to /1 will,be handled by the /:id route handler
```
### Simple Route

```typescript
app.get('/hello', (req, res) => {
  return { message: 'Hello, World!' };
});
```

### Route Parameters

```typescript
app.get('/users/:id', (req) => {
  const userId = req.params.id; // TypeScript infers the type as string
  return `User ID: ${userId}`;
});

// With type validation
app.get<{ id: string }>('/users/:id', (req) => {
  // req.params is properly typed
  return `User ID: ${req.params.id}`;
});
```

### Query Parameters

```typescript
app.get('/search', (req) => {
  const { q, page = '1', limit = '10' } = req.query;
  
  return {
    query: q,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
});
```

## Route Groups

### Basic Grouping

```typescript
const api = app.group('/api', {
  // Group-level middleware
  middleware: [apiAuth, rateLimiter]
});

// GET /api/users
api.get('/users', () => {
  return userService.getAllUsers();
});

```

### Nested Groups

```typescript
const admin = app.group('/admin', {
  middleware: [requireAdmin]
});

const users = admin.group('/users');

// GET /admin/users
users.get('/', () => {
  return userService.getUsers({ role: 'admin' });
});
```


## Route Parameters with Validation

```typescript
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid()
});

app.get('/users/:id', {
  params: paramsSchema,
  handler: (req) => {
    // req.params is validated and typed
    return userService.getUser(req.params.id);
  }
});
```

## Best Practices

1. **Organize by Feature**: Group related routes together
2. **Use Middleware Wisely**: Keep middleware focused and reusable
3. **Validate Input**: Always validate and sanitize user input
4. **Use Route Parameters**: For resource identifiers
5. **Keep Handlers Thin**: Move business logic to service layers

## Applying hooks to websocket routes


Since websockets work a bit differently than http routes there are two way with which you can approach them 


1. Apply the same middleware to ws routes

This works by enabling the `config.websocket.useSameMiddlewareAsHttp` option

```ts
app.config.websocket.useSameMiddlewareAsHttp.set(true)

app.config.websocket.useSameMiddlewareAsHttp.enable()

app.config.websocket.setBundle({useSameMiddlewareAsHttp: true})

app.config.websocket.enable(["useSameMiddlewareAsHttp"])
```
that way the general middlewares will be ran against the websocket routes too but it comes with the drawback of the need for the websocket requests to follow the convenction of the http 

for example if we have enabled the `config.http.useSameMiddlewareAsHttp` option then the websocket routes will also be protected by the auth middleware

```ts
app.use(guard({
  headers: {
    token: z.string()
  }
}))
```

and they would need to have a headers in each message like so 
```ts

client.ws.connect({headers: {token: "some-token"}})
client.ws.<some-route/>.send({
  headers: {
    token: "some-token"
  }
})

```
which is not ideal both in terms of code quality and performance

2. Applying specific middleware to ws routes

using the ws option 

```ts
app.use(ws(msg => { // the default is onMessage handler
  // this will only run against ws messages
}))
```

### how it works 

Well inside the hook we just check if it is a websocket request we are dealing with by checking the ctx object 
```ts
const isWebSocket = request.headers.get('upgrade')?.toLowerCase() === 'websocket';
```

### Options 

BeforeConnection

#### Scope 
only per app e.g. only global

```ts
app.use(ws())
```


## Lazy event handlers

You can define lazy event handlers using defineLazyEventHandler or lazyEventHandler utilities. This allow you to define some one-time logic that will be executed only once when the first request matching the route is received.

A lazy event handler must return an event handler:
```ts

import { defineLazyEventHandler, defineEventHandler } from "h3";

app.use(
  defineLazyEventHandler(() => {
    console.log("This will be executed only once");
    // This will be executed only once
    return defineEventHandler((event) => {
      // This will be executed on every request
      return "Response";
    });
  }),
);
```

This is useful to define some one-time logic such as configuration, class initialization, heavy computation, etc.


Using an empty return or return undefined make a 404 Not Found status response. Also using return null will make a 204 No Content status response.

