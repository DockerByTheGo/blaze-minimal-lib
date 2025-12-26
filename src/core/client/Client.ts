import { IRouteHandler } from "../server/router/routeHandler";
import { RouteTree } from "../server/router/types";
import { CleintBuilderConstructors } from "./client-builder/constructors";


export type Routes<R extends RouteTree> = {
    send<Route extends keyof R>(route: Route): R[Route] extends IRouteHandler<any, any> ? R[Route] ["getLCientRepresentation"] : Routes<R[Route]>
}

class ClientConstructors {
    empty() {
        return new Client({})
    }

    fromRoutes<TRouteTree extends RouteTree>(routes: TRouteTree) {
        return new Client(routes)
    }
}

export class Client<TRouteTree extends RouteTree> {
    public readonly routes: Routes<TRouteTree>

    public constructor(routes: TRouteTree) {
        this.routes = {
            send: <Route extends keyof TRouteTree>(route: Route): TRouteTree[Route] extends IRouteHandler<any, any> ?  TRouteTree[Route]["getLCientRepresentation"] :  => {
                // In a real client, this method would construct and send an HTTP request
                // based on the `TRouteTree[Route]["getLCientRepresentation"]` definition
                // and return a Promise of the response.
                // For this example, we just return the client representation definition itself.
                // A more complete implementation would involve a network call.
                console.log(`Preparing client representation for route: ${String(route)}`);
                return routes[route as string]["getLCientRepresentation"];
            }
        };

    }

    batch(v: Routes<RouteTree>) {

    } // send multiple requests as one to avoid multiple hadnshakes


    /* 
    
    Sends the schema it has recieved against the server to see if they are matching, just a type quard, to inform the cleint, also note that this should be removed in prod to not ,ake enumeration attacks easier 
    
    probably needs to be inside blazy edge 
    */
    confirmSchema() { }


}

// Example RouteTree definition
// Example usage
const myRouteDefinitions = {
    "/users": {
        getLCientRepresentation: {
            method: "GET",
            path: "/users",
            response: [] // Runtime value not relevant for type definition
        }
    },
    "/users/:id": {
        getLCientRepresentation: {
            method: "GET",
            path: "/users/:id",
            params: { id: "" }, // Runtime value not relevant for type definition
            response: { id: "", name: "" } // Runtime value not relevant for type definition
        }
    }
} satisfies RouteTree



const client = new Client(myRouteDefinitions);

// Getting the client representation for a specific route

const userByIdRouteClientRep = client.routes.send("/users/:id");
console.log("User by ID Route Client Representation:", userByIdRouteClientRep);

// In a real scenario, you might have a utility function or another method
// on the client that takes this representation and makes the actual request.
// For example:
/*
async function executeRequest<T>(clientRep: { method: string, path: string, params?: any }): Promise<T> {
    // ... actual HTTP request logic ...
    console.log(`Executing ${clientRep.method} request to ${clientRep.path}`);
    return {} as T; // Mock return
}

// And then use it like:
const users = await executeRequest<MyRouteTree["/users"]["getLCientRepresentation"]["response"]>(usersRouteClientRep);
console.log("Fetched users:", users);
*/
