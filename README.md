# Name 

@blazy/http-core


this is the core of the project which is more of a lib than a framework


add winter js support so that it can run on any framework

# Concepts

## Config

### Concept
this is used to change the behaviour of how a blazy app works

### Scope

configs also have scope for exmaple you want to apply a bundle of settings to your app and reuse it as a lib 

### Implicit defaults

following our implicit defaults for writing less code without losing customizability all config options come with defaults 

There are two ways to make config 

### Imperative

only set what you need the rest remains as is 

it is the default when adding a config but if you need to pass it explicitely it is done as so 
```ts
import {ConfigBuilder} from "@blazy/utils"


app.use(ConfigBuilder.createImpreative({...}))


```

### Declarative

will overwrite all previous config options with the desired

```ts
import {ConfigBuilder} from "@blazy/utils"

app.use(ConfigBuilder.createDeclarative({...}))
```
### Locking options 

Note: since changing some settings in the middle of the code can cause problems which you will have to be aware of you have the option of locking the config or individual options


```ts
app.use({
option: {value: ..., isLocked: true}
})

// or to lock a whole config 

app.use(Lock({...}))

```

#### Runtime safety 
during the init where the app performs all the `use` statements before starting the app if we change an option which is locked we will get a `Option x is locked, it cant be changed` runtime error 

#### Typesafety 


also during compile time changing an option which is locked will return never 

```ts
app
.use({option: {value: "", locaked: true}})
.use({option: "") // returns never 
```


## Hooks
hooks are a piped way to intercept the data flow in its lifecycle 

### Piped ? 
yeah piped means that every hook return is input of the next allowing you to make some pretty complex pipelines

### Lifecycle

This is just the full process of how a class lives for example a lifecycle every class has is getInitilzed -> invoke a method -> get wiped put when out of scope

And using hooks we can add logic between each of these distinct events

They are cool since they allow you to decouple side effects from the main business logic of the class



## Subapps

Think of subapps as collection of hooks and routes to apply to your main app. Although not that they have their own scope


A component is a plugin that could plug into other instances.

It could be a router, a store, a service, or anything else.

This forces you to break down your application into small pieces, making it easy for you to add or remove features.

think of your subapps less if a router and more like a bundle of operations you have grouped logically and apply to yor app. Although that is not 100% right since apps have their own scope too



### Usage 

To use subapps we just use the `.use()` method and pass a `Blaze` instance  


### Scope

default, event/life-cycle in each instance is isolated from each other.


```ts

const usersSubApp = new Blaze()
.use(req => if(!req.tokeen){ return })
.get("/protected", req => ...) // here the above middleware will be applied

const otherApp = new Blaze()
.use(usersApp)
.get("/unprotected", req => ...) // here the middleware from above wont be triggered since by default it is scoped to "`local`"

```

In this example, ip property is shared between ip and server instance because we define it as global.

This forces you to think about the scope of each property, preventing you from accidentally sharing the property between instances.

#### Overwriting default scope 

to overwrite what the default scope is you can change the `config.defaultScope.set("local" | "global" | "inheriting")`


# App api
Note: in this doc the word `app` and a `Blaze` instance are synonimus 

## lazy

You can provide an async function that will load on first time a request matching the route is received. It's useful for dynamic imports to reduce startup time.
```ts
app.use("/big", () => import("./big-handler"), { lazy: true });
```

this is help when you need faster startup time if possible. For example you have a lambda for the server which spins up the server but the server needs to init a very heavy resource which one route uses, you can use lazy to only load the handler when the route is called. 


## Expose service

this allows you to pass an object and its public methods become endpoints. By default every method is gonna be post and no validation is enforced since there is  no schema to get. If the object implements the ICrudified interface it will be translated to the appropirate http verbs however there is still no validation. Also you can pass the "guess" flag as a scond arg and it will try to guess the metthods from the object (for example if a method has get in the name it will be  a get if it has create it will be post, etc...). To enforce validation you can use our ObjectBuilder builder which allows you to define the type for the arg of a func using a vakidator 


ObjectBuiler.new({docs: ""}).addPrivateProperty("name-of-property", property).addPrivateMethod(internalCtx /*contains name of property, all properties and all previously defined methods*/ => ..., {docs: "idk"}).addPublicMethod("name", z.object({}), ({internalCtx, arg}) => {...}, {docs: "idk"})


this will allows us to safeguard and include validation and even docs for the endppoints


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


# Hooks


## onInit

runs during the init process of the app before making the server ready to accept connections



## General things

### The return of the previous is the context of the next

### Helpers

these are some helper hook builders for common use cases

#### Add 

adds you return to the ctx of the next


imagine in a hook you need to add to the context of the app an isAdmin attr 

with the normal hook you will have to do 

```ts
app,hook(ctx => {
  // your code
  
  return {...ctx, isAdmin: true}
  
  })
```

although not terrible it is not the best way to do it 

With this helper you do

```ts
app.hook(add( () => {
  // your code to check it 
  return {isAdmin: true}}), "add admin status")
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

app.hook(ctx => {
	//  your code
  return ctx
})

```





### Name

ever hooks needs a name so that it can be identified ad and thus it needs to be unique (NOTE: if you try calling a hook and then you recieve never as the result of the hook it means you have used a name that has aleady been taken, also recieve intelllisense with all existing hooks names in the name field)

### App Scope
you need to define the scope to which a hook will apply. For that you need to specify the name of the subapp. Since this can be tedious at times we provide some shorthands

```ts
app.hook(handler) // by default it is to the local router

app.hook(handler, "name-of-subapp") // on a specific app

app.hook(handler, "base") // at thr first level of apps e.g the root app
```

### route vs app hooks 

some hooks can be applied per router level so that they only apply to one router. 


Why ?

well it improvies readability since you logically separate components of your handler


### inheritance scope

Should the middleware also be ran when a sub app is detected


For example we have 

```ts

const hook = v => console.log

rootApp

subApp.hook(hook, "base", /* "noInheritance"*/)

// Like this it will console log when a request is handled by either the root or the subapp

// However if we uncomment the code ot will only log when a requeat is handled by root

```


This is helpful when we use a subApp in our App and we want to apply it obly to this route even if it has choldren subapps

### Throwing an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.
```ts

app.service('messages').hooks({
  before: {
    create: [
      async (context: HookContext) => {
        if (context.data.text.trim() === '') {
          throw new Error('Message text can not be empty')
        }
      }
    ]
  }
})
```
## Types 

### on route definition
runs every time you define a route
```ts
app.onDefinedRoute(metadata => ...)
```

the metadata conatinas all kinds of info like the url, the type (for example websocket or rsw http) all defined validators and any extra fileds you have defined


### onError 

#### local and app


### onStartup

ran right before the server starts accepting connections e,g, before any route can be invoked so its a good idea to place any iinit code here

### onRegisteredHook

as you can guess this runs each time a hook is registered

### hook 
the most basic hook, behaves just like a middleware if it is placed after a route deifinition it wont run for the certain route. E.g. it runs only for routes registered after it 

### before
#### local and global
runs before every handler in the app even if it is placed after an enpoint unless providing the `runBefore: false` flag 


Note: if new return a `Response` object from this handler we will skip the handler and all after hooks and get to after Response

### after  

### afterResponse
#### local and global 
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


### routify

Allows you to pass an object and we automatically expose its PUBLIC (private wont be exposed) methods as endpoints. By default it exposes everything as post req and everything is in the body but if the object implements the ICrudufied Interface it exposes it a bit better with get, delete etc..



## Global error handling handler



# Jobs 

https://docs.redwoodjs.com/docs/background-jobs/

Get more inspo from here


![[Screenshot_20250704_203629_Chrome.jpg]]

jobs are scripts which run during the course of the app lifecycle ands have access to the global context obj. What makes thme better than making your jobs seperate from the app is that they have access to the app ctx nothing else. 

## How they work 

they are kinda treated like endpoints (so that they have access to the ctx object) and are called peridocally so whenever they are called all non route specific hooks run for them 

## How to use them
```ts
const job = new Job({handler: ctx => ..., type: JobTypes.Interval(5, "mins" /* has intellisense */), metadata:{tags: []}})
app.addJob("name",job)
```

or anoter overload is 

```ts
app.addJob({"nae]me": job, "name": job2})
```

or
```ts
app.addJob(Job.new({handler: ..., metadata: {name: ""}})) 
```
Note for this overload to work you need to supply the name inside metadata. It is helpful to use this wgen you are building a package for a certain job and want to free the user of naming it 

## Options
### StartWhen
It accepts a timed job e.g. interval etx... but instead of starting directly it setups the timer after the first call of the job

### TTL 
Option is which defines time the function shouldnt exceed when executing, time is in milisecs and should abide to setInterval limits
### Types
#### Interval(number, time_period: "mins" | "hours" | "secs" | "ms")
note if the number and type converted to ms is above 2,147,483,647 or below 0 an error will be thrown. For longer jobs please usethe LongInterval since it uses a different mechanisms to repvent overflows. It has the same syntax

#### Repeat(numberOfTimesToRepeat)

#### None
It does not execute the job with a timer instead it just adds it to the jibs context. This is useful whrn you need to have a reusable logic but still maintain the hooks


#### Once() 
just a shorthand for Repeat(1, ctx => ...) makes the code more readable

#### Twice()


#### OnDate(DateRegex | Range[] | Date[] | customFunc)

#### DateRegex

for date regex you supply it in this format
YYYY/DD/MM

for example 

2,0,[1-9],[1-9]_[1-5],[1-5]_0,[1-4]

#### Range
you can supply a range of dates 


for example a valid argument is [DateRange.new("2020_01_19", "2020_05_19")]

the DateRange just checks if the first is before the second and if not it throws an error 2

#### CustomFunc

it is ran every day (e,g, everytime the date chnages) and accepts the date as an argument and it should return true or false.

This is cool for when you need to have some complex logic based on the date whether to do something or not 

---

Note: each job must have a name so that they can be idetified



## Bundling
If you want to share some common properties between multiple jobs you can. Reate a bundler

```ts
const bundle = JobBundle
.new({metadata:{tags: []}, groupName: ""})
.beforeEach(() => ctx /* this will be recieved by the jibs, for example you have two jibs which run against a db you can pass the connection from  here instead of initing it at two times in the handlers*/)
.afterEach((ctx) => /* something to do with the return of each job  for example close db connection */ ctx)
.addSubGroup(new JobBundle())
```


Destructuring bundles 

If you do not wish for the jobs to be in the group simply omit the groupName from the options

## Querying
### Complex Queries
you can query jobs using our QL language which allows you to query jobs based on their metadata or you can select them using groups, names or tags individually

```ts
app.jobs.query(where(name, selector: or(is("sendEmail"), contains("send"))))
```
this returns a job instance object which gives access to all the fields of a job and also the hooks and the invoke method which runs the job programatically

```ts
app.jobs.fromGroup("group-name").map(res => {
  res.jobs.fromGroup() // returns sub groups of the group if any 

  const job = res.jobs.get("job-name") // has intellisense

  job.onExecuted(() => {...})

  job.onRegistered(() => {...})



})

// or 

app.jobs.fromTags(["tag1", "tag2"]).map(res => {
  
}) // try to have intellisense on this too


app.jobs.fromTag("tag").name // gives "names", has intellisense, do this first since its easier to implement

```

#### Default grouping

By default a job is attached to its groups the substrusture it belongs to 


For example

```ts
JobBundle
.new({groupName: "group-1"})
.addSubBundle(JobBundle.new({groupName: ""}))
```

Now the second one is also in group-1 


## Hooks

### Types
#### Register Resource

This is done if you need to manage some kind of countable resource, for example `jobs` are managed like that since it gives you acces to a lot of goodies

#### OnRegistered
#### OnExecuted

# Router

## Resolution

## regex for path params
You can define a regex for path param and the handler will run when the regex is met in a request

## customRedolver for path params


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

### Priority

This is how the router decides where a request should go if it is matched by multiple requests

It follows this order
1. Static ones
2. Dynamic witth custom resolvers
3. Dynamic

#### overwriting

If you want to override this order for some reason yoi can pass the priority flag and set a value of 1 2 3 and it will be trested as if it is ij the selcted group. And if you want to be the first ine in a certain group also pass the befirst flag. When passed it will take priority within its group, for example if multiple requests within group one match a request the one with beFirst will executed. 

Note that these options should be avoided since they slow the router dramatically

If no priority is given in a group it gets the first one that matches and they are in order of adding

For example
```ts
app.get('/:id')
app.get('/:otber')

// A call to /1 will,be handled by the /:id route handler
```
## The handler object

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



