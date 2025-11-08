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
