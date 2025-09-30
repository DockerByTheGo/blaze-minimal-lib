import { Router } from "../server/types";
import { ClientReponse } from "./client";

export type ClientHooks = {
    beforeSend: unknown[];
    afterReceive: unknown[];
    onErrored: unknown[]; // a type of afterReceive
};type Client<R extends Router> = {
    [Route in keyof R]: (arg: {
        data: R[Route]["RequestData"];
    },
        options: {
            retry?: boolean;
        }
    ) => Promise<ClientReponse<R[Route]["Responses"][number]>>;
};

export type Config = {
    retries: number;
}