import { RouteTree } from "../../server/router/Router";
import { ClientReponse } from "./ClientReponse";

export class Client<R extends RouteTree> {
    routes: {
        [Route in keyof R]: (arg: {
            data: R[Route]["RequestData"];
        },
            options: {
                retry?: boolean;
            }
        ) => Promise<ClientReponse<R[Route]["Responses"]>>;
    }
}

