import { Router } from "../../server/Router";
import { ClientReponse } from "./ClientReponse";

type Client<R extends Router> = {
    [Route in keyof R]: (arg: {
        data: R[Route]["RequestData"];
    },
        options: {
            retry?: boolean;
        }
    ) => Promise<ClientReponse<R[Route]["Responses"]>>;
};
