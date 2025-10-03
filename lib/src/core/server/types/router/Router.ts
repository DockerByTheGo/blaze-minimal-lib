import { RouteHandler } from "./RouteHandler";

// for now we will use hono router


export type Routes = Record<string, RouteHandler | >;

class RouterSettings {
    constructor(
        protected autoPrefixPathName?: boolean, // e,g, if we give api as prefix, it will automatically add the missing "/"" when building the route tree 
        protected redefineRoutes?: boolean,
    ) {}
}

export class Router<TRoutes extends Routes> {
    constructor(
        protected routes: TRoutes,
        protected settings: RouterSettings
    ) {}

    private getPart(url: string) {
        return url.slice(0,url.indexOf("/"))
    }

    route(req: {url: string}) {
        this.getPart(req.url)
        let currentUrl = req.url        
        let route: RouteHandler = null

        while(true){
            route = this.routes[this.getPart(req.url)]
            if(currentUrl.length < 1){
                return route.handler()
            }
        }
    
    } 
}