# Router

## Overview

The Router in @blazy/http-core provides a powerful and flexible way to handle HTTP requests. It supports route parameters, middleware, and route groups, making it easy to organize your application's endpoints.

## Defining route handlers 

There are two parts to defining a route handler. Defining the route matcher (e.g. for which routes to run the handler) and the handler   

#### Route matcher 

##### types

###### customRedolver for path params


You can  use the CustomResolver to define a path param logic
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


###### normal resolver

```ts
app.get(
  NormalResolver(
    "/:userId/user",
    { // if no schema is provideed it will interpret alll dynamic arguments as strings
      userId: z.number() // has intellisense
    }
    )
    
    )
```

###### dsl Resolver

f

##### Priority

This is how the router decides where a request should go if it is matched by multiple requests

It follows this order
1. Static ones
2. Dynamic witth custom resolvers
3. Dynamic

###### overwriting

If you want to override this order for some reason yoi can pass the priority flag and set a value of 1 2 3 and it will be trested as if it is ij the selcted group. And if you want to be the first ine in a certain group also pass the befirst flag. When passed it will take priority within its group, for example if multiple requests within group one match a request the one with beFirst will executed. 

Note that these options should be avoided since they slow the router dramatically

If no priority is given in a group it gets the first one that matches and they are in order of adding

For example
```ts
app.get('/:id')
app.get('/:otber')

// A call to /1 will,be handled by the /:id route handler
```

### Route handlers

#### Defining responses

unlike in express where you have to use  the res.send() on blazy your return is treated as the response 

##### Basic returns
```ts
app.get("/user", () => {
  return "hi" // returns a usccesfull response with the body of hi, by default it sets it to content typetext/plain 
})
```

```ts
app.get("/user", ctx => {
  return new File("./koko.kson") // will set it automtically to file 
})
```

###### Rules


####### every non null response is treated as succesfull

```ts
app.get("/user", () => {
  return {hi: null} // will return {status: 200, body: {ji: null}} 
  // Automatically sets Content-Type: application/json


  return null // will return {status:500, body: "something happened"}
})
```

####### undefined is treated as 404

```ts
app.get("/:userId", (ctx) => {
  return ctx.body.userId > 5 ? undefined : new User(userId) // if it is undefined it will resolve to {status:404}
  }
)
```

```ts
app.get("/userId", (ctx) => {
  return createReadStream() // will return a read stresm
})
```

##### Fine graned returns

if you want to be explicit about the returns you send you can use the Response object 

```ts
app.get("/user", () => {
  return new Response(200, null)
})
```

###### Helpers
Since there are s lot of redundant uses we hsvve some utilities like 

```ts
Responses.Succesful({...})
Responses.NotFound()
Responses.Redirect("...")
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





----



#### `all(path: string, ...handlers: RequestHandler[]): this`

Matches all HTTP methods for the given path.

```typescript
app.all('/api/*', (req, res, next) => {
  // This will run for all requests to /api/*
  next();
});
```

#### `route(path: string): Route`

Creates a new route instance for the given path.

```typescript
app.route('/users')
  .get((req, res) => {
    // GET /users
  })
  .post((req, res) => {
    // POST /users
  });
```

---


# Request Lifecycle

## Overview

Understanding the request lifecycle in @blazy/http-core is crucial for building efficient and maintainable applications. This document explains the complete flow of an HTTP request through the framework.

## Lifecycle Phases

1. **Incoming Request**
   - Request is received by the HTTP server
   - Request and response objects are created
   - Global middleware is initialized

2. **Middleware Execution**
   - Global middleware runs in the order it was added
   - Route-specific middleware executes
   - Each middleware can modify the request/response or end the request

3. **Route Matching**
   - The router matches the request URL and method to a route handler
   - Route parameters are extracted and validated
   - Query parameters are parsed

4. **Request Processing**
   - Route handler executes with the request context
   - Business logic is processed
   - Database queries and other I/O operations occur

5. **Response Generation**
   - Response is created with appropriate status code and headers
   - Response body is serialized (if needed)
   - Response is sent to the client

6. **Cleanup**
   - Response is finalized
   - Resources are cleaned up
   - Connection is closed

## Visual Representation

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Incoming      │────>│  Global          │────>│  Route           │
│  Request       │     │  Middleware      │     │  Middleware      │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                 │                        │
                                 ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Route          │<────│  Route           │<────│  Response        │
│  Handler        │     │  Matcher         │     │  Generator       │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Business       │     │  Error           │     │  Response        │
│  Logic          │     │  Handler         │     │  Sent            │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

## Middleware Execution Order

1. Application-level middleware (app.use)
2. Router-level middleware (router.use)
3. Route-level middleware (route.use)
4. Route handler

## Error Handling Flow

1. If an error occurs in any middleware or route handler:
   - The error is caught by the nearest error-handling middleware
   - If no error handler is found, the default error handler is used
   - The error response is sent to the client

## Customizing the Lifecycle

### Adding Global Middleware

```typescript
// Runs for every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

### Error Handling Middleware

```typescript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});
```

### Async/Await Support

```typescript
app.get('/users/:id', async (req) => {
  const user = await userService.getUser(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
});
```