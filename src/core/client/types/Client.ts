import { RouteTree } from "../../server/router/types";


export type Routes<R extends RouteTree> = {
    send<Route extends keyof R>(route: Route): R[Route]["getLCientRepresentation"]
}


export class Client<TRouteTree extends RouteTree> {
    public readonly routes: Routes<TRouteTree>

    constructor(routes: TRouteTree) {
        this.routes // TODO: popuate it 
    }

    batch(v: Routes<RouteTree>) {

    } // send multiple requests as one to avoid multiple hadnshakes
}

