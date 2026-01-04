
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

