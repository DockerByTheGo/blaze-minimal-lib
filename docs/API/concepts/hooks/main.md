# General

## Overview

Lifecycle hooks in @blazy/http-core allow you to tap into specific moments in your application's execution flow. These hooks provide a way to execute code at different stages of a request/response cycle, enabling you to manage resources, modify behavior, and handle errors effectively.

## General things

### The return of the previous is the context of the next

### Name

ever hooks needs a name so that it can be identified ad and thus it needs to be unique (NOTE: if you try calling a hook and then you recieve never as the result of the hook it means you have used a name that has aleady been taken, also recieve intelllisense with all existing hooks names in the name field)

### App Scope

you need to define the scope to which a hook will apply. For that you need to specify the name of the subapp. Since this can be tedious at times we provide some shorthands

```ts
app.hook(handler); // by default it is to the local router

app.hook(handler, "name-of-subapp"); // on a specific app

app.hook(handler, "base"); // at thr first level of apps e.g the root app
```

#### inheritance scope

Should the middleware also be ran when a sub app is detected

For example we have

```ts
const hook = v => console.log;

rootApp;

subApp.hook(hook, "base", /* "noInheritance" */);

// Like this it will console log when a request is handled by either the root or the subapp

// However if we uncomment the code ot will only log when a requeat is handled by root
```

This is helpful when we use a subApp in our App and we want to apply it obly to this route even if it has choldren subapps

#### Throwing an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.

```ts
app.service("messages").hooks({
  before: {
    create: [
      async (context: HookContext) => {
        if (context.data.text.trim() === "") {
          throw new Error("Message text can not be empty");
        }
      }
    ]
  }
});
```

## Types

### Router hooks

#### hook

the most basic hook, behaves just like a middleware if it is placed after a route deifinition it wont run for the certain route. E.g. it runs only for routes registered after it

#### before

##### local and global

runs before every handler in the app even if it is placed after an enpoint unless providing the `runBefore: false` flag

Note: if new return a `Response` object from this handler we will skip the handler and all after hooks and get to after Response

#### after

#### afterResponse

##### local and global

runs after a route returns a response and as context has access to the response. This is only for the first hook in this stack the next of this are like the other hooks the ctx of the next hook is the return of the previous

#### Subhooks

tapAfterResponse -> allows you to perform something on a afterResponse ctx obj without modyfing it and passing it autoamatically

Behind the scenes it works like this

```ts
app.tapAfterReponse(ctx => ...) -> app.aftreResponse(v => {clone(v).map(yourHandler); return v})
```

### attach

a wrapper of hook which allows you to attach context to the global context more easily

Example

```ts
// With

app.attach("something", something)

// without

app.hook(c => {...c, "something": something})
```

#### on route definition

runs every time you define a route

```ts
app.onDefinedRoute(metadata => ...)
```

the metadata conatinas all kinds of info like the url, the type (for example websocket or rsw http) all defined validators and any extra fileds you have defined

#### onError

runs each time an error is thrown inside a route handler, this is important to remeber since its different from the app.lifecycle.onError which runs when an error is thrown inside anywhere in the app, while this is more specific and runs only inside to the router

##### local and app

#### OnError

`onError(handler: ErrorHandler): this`

Register a global error handler.

```typescript
app.router.onError((err, req, res) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});
```

#### onInit

runs during the init process of the app before making the server ready to accept connections

### On

`on(event: string, listener: (...args: any[]) => void): this`

Listen for application events.

```typescript
app.on("listening", (port) => {
  console.log(`Server started on port ${port}`);
});

app.on("error", (err) => {
  console.error("Server error:", err);
});
```

### Helpers

#### Add

adds you return to the ctx of the next

imagine in a hook you need to add to the context of the app an isAdmin attr

with the normal hook you will have to do

```ts
app, hook((ctx) => {
  // your code

  return { ...ctx, isAdmin: true };
});
```

although not terrible it is not the best way to do it

With this helper you do

```ts
app.hook(add(() => {
  // your code to check it
  return { isAdmin: true };
}), "add admin status");
```

or if you just need to attach something without much computatuon ther is another overload

```ts
app.hook(add({isAdmin: true}, "add admin status")
```

``
this will add it to the context

#### Tap

for when you need to do some kind of side effect without modyfying the contect

```ts
app.hook(tap(ctx => ....))
```

without it

```ts
app.hook((ctx) => {
  //  your code
  return ctx;
});
```

### Others

### Lifecycle hooks

#### onStartup

ran right before the server starts accepting connections e,g, before any route can be invoked so its a good idea to place any iinit code here

### Helpers

these are some helper hook builders for common use cases

### Hook Manager

#### onRegisteredHook

as you can guess this runs each time a hook is registered

#### onHookExecution
