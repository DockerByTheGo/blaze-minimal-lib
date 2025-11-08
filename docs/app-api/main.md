# App API

## Overview

The App API provides the core functionality for creating and managing your @blazy/http-core applications. This document covers the main methods and properties available on the Blaze application instance.
## Core Methods


### Use 

`use(middleware: Middleware | Middleware[], options?: MiddlewareOptions): this`

Add middleware or subapps to the application.

```typescript
// Add a single middleware
app.use((req, res, next) => {
  console.log('Request received');
});

// Add multiple middleware
app.use([
  middleware1,
  middleware2,
  subapp // Can also mount subapps
]);

// With options
app.use(middleware, {
  path: '/api', // Only apply to this path
  method: 'GET' // Only apply to GET requests
});
```

## Expose service

this allows you to pass an object and its public methods become endpoints. By default every method is gonna be post and no validation is enforced since there is  no schema to get. If the object implements the ICrudified interface it will be translated to the appropirate http verbs however there is still no validation. Also you can pass the "guess" flag as a scond arg and it will try to guess the metthods from the object (for example if a method has get in the name it will be  a get if it has create it will be post, etc...). To enforce validation you can use our ObjectBuilder builder which allows you to define the type for the arg of a func using a vakidator 


ObjectBuiler.new({docs: ""}).addPrivateProperty("name-of-property", property).addPrivateMethod(internalCtx /*contains name of property, all properties and all previously defined methods*/ => ..., {docs: "idk"}).addPublicMethod("name", z.object({}), ({internalCtx, arg}) => {...}, {docs: "idk"})

this will allows us to safeguard and include validation and even docs for the endppoints

## Server Control

### `listen(port?: number, hostname?: string, backlog?: number): Promise<Server>`

Start the server.

```typescript
const server = await app.listen(3000, '0.0.0.0');
console.log('Server started on port 3000');
```

### `close(): Promise<void>`

Gracefully shut down the server.

```typescript
process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});
```


## macros

Macros are a way to design reusable bundles of hooks with typesafety and have them as part of your app 



Example 


imagine we have two endpoints and each of them needs a token for auth, however it is of different length for each and in route one it is a number the other is a string. Normally without macros we would do it like this 

```ts
app.post("/create", ({req: {headers: {adminToken}}}) => {...}, {
  beforeRequest: guard({req: {headers: adminToken: "string"}})
})


app.post("/create-2", ({req: {headers: {adminToken}}}) => {...}, {
  beforeRequest: guard({req: {headers: adminToken: "number"}})
})
```

if you ask me thats a lot of redundancy so lets see how macors would help us with this 


```ts
app.addMacro({
  name: "ensureAdminToken"
  arg: z.union([z.string(), z.number])
  handler: ({arg, ctx}) => {
    return {
      beforeRequest: guard({req: {headers: {adminToken: v}}})
    }
  }
})

app.post("/create", (req: {headers: {adminToken} /*  yup it even adds intellisense so that you get autocomplete on all your macors */}) => {...}, {
  ensureAdminToken: z.string() 
})


app.post("/create", (req: {headers: {adminToken} /*  yup it even adds intellisense */}) => {...}, {
  ensureAdminToken: z.number() 
})

```

ok that seems cool but why i dont make it into just object which i can pass

```ts
const block = ({arg: Either<number, string>, ctx: BaseAppContext}) => {
  return {
    beforeRequest: guard({req: {headers: {adminToken: arg}}})
}  

app.post("/create", (req: {headers: {adminToken} }) => {...}, {
  ...(block(z.number()))
})

...
```

well thats cecrtainly viable but you lose two things

1. context types
 
```ts
app.addMacro(({arg, ctx}) => ....)

app
```

 you get access to ctx with all of services with type safety 

 without chaining it but instead making it in some variable you lose the type info and will have to either cope with it or get the type of your app at the time and do some ugly shit like this


```ts
const g = app
.method()
.method()
.method()

type app = typeof app


const macro = ({arg: Either<number, string>, ctx: app["context"]}) => {
  return {
    beforeRequest: guard({req: {headers: {adminToken: arg}}})
}  


g.method()
g.method()
...
...

```

this is ugly to say the least and you get no benefit from it either compared to addMacro and even lose types

2. hook support


just like any other thing when you pass something to the app you will most likely get hooks for it. Here it is the case for it again we get hooks. 

- onExecuted({nameOfTheMacro: str, passedContext: {arg: YourSchema, AppContext}})
- onAdded({nameOfTheMacro: str, passedContext: {arg: YourSchema, AppContext}})

