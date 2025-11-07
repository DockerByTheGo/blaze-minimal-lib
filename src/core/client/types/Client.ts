import { Router } from "../../server/router/Router";
import { ClientReponse } from "./ClientReponse";

export class Client<R extends Router> {
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
