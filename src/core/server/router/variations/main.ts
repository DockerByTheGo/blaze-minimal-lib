import { cleint } from "../../../../../examples/simpleWebServer"
import { ClientBuilder } from "../../../client/client"
import { ClientHooks } from "../../../client/types/ClientHooks"
import { Hooks } from "../../../types/Hooks/Hooks"

type URecord = Record<string, unknown>


interface IRoute {
    getLCientRepresentation: unknown
}


type OneTo500 = 1 | 2 | 200

export class HttpRoute<
    TSchema extends {
        Request: { body: URecord, headers?: URecord },
        Responses: { [x in OneTo500]?: URecord }
    }> implements IRoute {
    constructor(public v: TSchema) {

    }

    getLCientRepresentation: (arg: TSchema["Request"]) => TSchema["Responses"]
}

export type RouteTree = { [segment: string]: RouteTree | IRoute }

export class Router<TRouteTree extends RouteTree> {
    constructor(public _g: TRouteTree = {}) { }

    add<TRoute extends IRoute, TPath extends string>(v: { path: TPath, route: TRoute }): Router<TRouteTree & { [x in TPath]: TRoute }> {
        return
    }

    generateCleint(): ClientBuilder<
        TRouteTree,
        ClientHooks
    > {
        return {}
    }

}


const client = new Router()
    .add({
        path: "/",
        route: new HttpRoute(
            {
                Request: {
                    body: { hi: "" },
                },
                Responses: {
                    "1": { hi: "" }
                }
            }
        )
    }).generateCleint().createClient()

client.routes["/"]({ "body": { "hi": "" })