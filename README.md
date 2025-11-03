# @blazy/http-core

This is the core of the project which is more of a lib than a framework.

## Getting Started

Add Winter.js support so that it can run on any framework.



# Router


## Making responses

### respondWith(e: Response)
by default the response is the return value of the handler. However you can use the ctx object to make a response and send it without returning from the function 

Note: if you return something from the handler with ctx.respondWith it wont be sent and so it wont go through afterResponse hooks however it will be passed to afterHandler Hook 
```ts
() => {ctx.respondWith(new Response("Hello World")

  // the rest of the code will still exexcute

  return ... // will be fed into afterHandler
}
```

Note: when using ctx.respondWith even if you return a response it wont be send and also the moment you call respondWith the afterResponse hook will fire not waiting for the handler to finish  and running with whatever the respondWith was passed

### predefined behaviour for retuns 

return undefined -> 204 No Content
return null -> 404 Not Found
return string | object | array | number | boolean -> 200 OK and whatever you have returned

for example 

```ts
app.get("/idk", handler => {
  return "idk" will return 200 OK with the body "idk"
})
```

Note: this is not true for hooks. To return a Response from a hook you need to explicitely return a Response no matter the state of the setting

### implicit response
if you do not want any kind of return to be the response you can disable implicit response

#### setting it 

app.config.ImplicitReponse.set(boolean) 

app.config.ImplicitReponse.disable()

app.config.ImplicitReponse.enable()




and this will require implicitely defining responses like 

```ts
app.get("/idk", handler => {
  return Response.successfull("idk")
  // or 
  return Response.new("idk", 200)
}, {
	responses: {
		status: 200,
		body: "idk"
	}
})
```


### afterHandler (({ctx: Context, result: any}) => any)

this is a hook which operates with whatever the handler returns  no matter if it is a respnse or not and also recieves the context which the handler had access to. Atleast thats the first hook in the afterHandler stack after it you decide on the context. If no response has been retirned the after Respons can return a response and will trigger the afterRsponse hooks, also after it returns a Response (you can use respondWith here too) its return is still fed into the next hook.




---



Note: if ImplicitResponse is enabled and we do not return any response from our handler that is of type response the afterHandler hook (not to be confused with the afterResponse hook) will follow and if in any of them there is  a respose it will be sent. This can be helpful in times where you have simple endpoints that just do something and the return is the same for all of them e,g, 204 No Content and so you can do something liek this. If ImplicitResponse is disabled and you do not return anything from a function since js returns undefined from void function it will return 204 No Content. If a response is returned but afterHandle



```ts
app.afterHandler(ctx => Response.new("ok", 200))
.post("/doJobOne", () => {...})
.post("/doJobTwo", () => {...})
.post("/doJobThree", () => {...})

```


Here is a pseudo code which ilustrates this 

```ts 
beforeHandler().map(result => {
  result.isResponse
   ?  sendResponse(res)
   :  handler(res),map(result =>
      ctx.confg.NoImplicitResponse.get() 
      ? result.isResponse 
        ? sendResponse(result) /* internally sets the ctx.response object to the sent response */ -> afterResponse and afterHandler Hooks fire  -> afterHandlerHooks.forEach(hook => hook(result).ifNoResponseIsSent(result => result.isResponse ? sendResponse(result) : result))
        : afterHandlerHooks.forEach(hook => hook(result).ifNoResponseIsSent(result => result.isResponse ? sendResponse(result) : result))
      : result
   ) 
  

})
```



### how it works

after a handler finishes its request ctx req object is checked for the didSendResponse flag and if it is trye we simply do not return the returned from the handler as a response


## Streaming 
Built in support for exposing streaming endpoints with tons of utilites. Like this but better, cleaner and with more features https://hono.dev/docs/helpers/streaming


## adding routes

```ts
app.get("/idk", handler, additionalConfig) // all validators and any additinal context you might pass so that you later recieve it in the onRegistedRoute hook 
```

If you have the middleware that you want to execute, write the code above the handler.

```ts
app.use(logger())
app.get('/foo', (c) => c.text('foo'))
```

If you want to have a "_fallback_" handler, write the code below the other handler.

```
app.get('/bar', (c) => c.text('bar')) // bar
app.get('*', (c) => c.text('fallback')) // fallback
```

```
GET /bar ---> `bar`
GET /foo ---> `fallback`
```

TODO: think how to incorporate this kind of logic in your existing pipes model
## abusing intelliense

blaze automatically picks up dynamic params from your handler 

"/:okko/hi" -> :okko will be accessible via intellisense 


##### special convention 
if you dont wanna use a validator object for specifying types you can also a special convention from our framework in which using prefixes you specify path parameters

```ts
app.get(
"/ji/:koko",
{"koko" /*btw you get intellisense here since koko is a path paramter*/: z.number()} , ctx => {
	ctx.req.params.isFloat() // autoamitacally tuerned into a number obj 
})
```

turns into 

```ts
app.get("/ji/:$koko",ctx => {
	ctx.req.params.isFloat() // autoamitacally tuerned into a number obj 
} )
```

to indicate that koko is  a number we prefix with "$" and like that you will recieve koko as a number object directly 

###### others
date -> (
boolean -> ^


## Request object

Wraps around the basic.request object but adds utilitilies like making optional query params follow the option pattern

### Api 

#### getRaw
returns the raw http object following the convention establised by express js

## Additional things

### Catch all route vs global router hook

Since there were a lot of questions about when to use a catch all route 

which is the following

app.all("\*")

vs a global hook handler

---

well the purpose of hooks is to accomodate existing routes, more like performing side effects or transforming data so that the route handler can do its job e.g. you should not put business logic inside a global hook and you should put it in a catch all handler 

There is is also another thing which is a catch all router is final e,g. other routes wont execute however with a global hook they will. 




# direct support for entites

## With name


## Without name

It gets the name of the variable at compile time


Syntax

```ts
.use(UserEntity)

```



# Service wrapping


### Service wrapping

When you pass your service to addService you not only recieve your original service option object but also you can subsribe to its events.

For example we have a user service

```ts
Class User{
add(){}
}





app
.addService(new User())
.block(app => app.ctx.services.user.onAdd(v => v))
```

In this case it might not be much but if a service is lets say a microservice and you want to react to its events wothout directly writing anything its pretty cool 


Allows you to add a microservice to your app which you can later reference and receive a single source of thrurh

Also when a service is added you get acess to ita hooks which are onQueried(method, dataPassedToMwthid, ReturnOfMethod)

OnAdded(the service obj)

You can subscribe to them either from the glbal swrvices object

Services.global.onAdded(name, object: intellisense using overloads)


Or subscribing to specific one 

services.[name].onQueried(method)
services.[name].onInitialsed

You can also hook into a specific method

Services.[name].onCreate(data // again intellisensed) // inyellisense
### Why is it helpful
Imagine the following scenario

You have a general backend and a job runner which has a single endpoint for processing a video. In the traditional way you have to manually generate a client refernce it etc
.. like that you just create the service using a `Service template` like the `HttpServer` where you define the structure and then you can include it using addService and you get intellisense on the service.


When you pass your service to addService you not only receive your original service option object but also you can subscribe to its events.

For example we have a user service

```ts
Class User{
add(){}
}

app
.addService(new User)
.use(c => c.services.user.onAdd(v => v))
```

In this case it might not be much but if a service is lets say a microservice and you want to react to its events wothout directly writing anything its pretty cool 



# Express support
you can plug a blazy app into existing express app and it will just work, that way you can gradually move to blazy from an existing express app 



# tech to steal from 
| #   | Name                          | Type                        | Notes                                                 |     |
| --- | ----------------------------- | --------------------------- | ----------------------------------------------------- | --- |
| 2   | **NestJS**                    | Full-featured framework     | Built with and for TS, very popular for scalable apps |     |
| 8   | **Elysia.js**                 | Full-featured Bun framework | Modern alternative to Express for Bun users           |     |
| 9   | nitro                         | Fullstack framework         | Used for APIs in fullstack apps, built-in TS support  |     |
| 12  | **Moleculer**                 | Microservices framework     | Has strong TS typings, feature-rich                   |     |
| 13  | **LoopBack 4**                | API-centric framework       | Strong TypeScript support, focuses on OpenAPI         |     |
| 14  | Laravel                       | Middleware framework        | Deno-native, strongly typed                           |     |
| 17  | **SuperTokens**               | Auth framework              | TypeScript-first, backend identity management         |     |
| 18  | **Serverless Framework (TS)** | Infra-as-code               | Backend infra and logic with TS support               |     |
| 19  | hapi                          | GraphQL servers             | TS-friendly GraphQL server tools                      |     |
|     | adonis js                     |                             |                                                       |     |
|     | Tanstack router               |                             |                                                       |     |
|     |                               |                             |                                                       |     |




# Future plans



https://www.instagram.com/reel/DLSAiolImTM/?igsh=NmI1aXNxanRvdWM=

https://www.instagram.com/reel/DHykdrws7Re/?igsh=MWZkOGk2aHlyc3EzaA==



