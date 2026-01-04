### onInit

runs during the init process of the app before making the server ready to accept connections

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
