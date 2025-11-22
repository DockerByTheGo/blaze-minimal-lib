
class HttpOnlyRouter<T extends HttpOnlyRoutes>{
    constructor(private v: T){

    }


    post<TName extends string, TBody extends URecord, TResponse extends HttpResponse>(v: {
        path: TName,
        bodySchema: TBody, 
        TResponseSchema: TResponse // use noInfer
        handler: (arg: TBody) => NoInfer<TResponse>
    }){

    }
}
new HttpOnlyRouter({})
    .post({
        path: "/users/:name",
        bodySchema: {"name": ""},
        TResponseSchema: {name: "", status: 200} as const,
        handler: v => {return {"status": 200,"name": "" } as const}
    })
