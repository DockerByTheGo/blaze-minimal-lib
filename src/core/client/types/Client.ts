
import { RouteTree } from "../../server/router/variations/main";
import { ClientReponse } from "./ClientReponse";

export class Client<R extends RouteTree> {
    routes: {
        [Route in keyof R]: R[Route]["getLCientRepresentation"]
    }
}

