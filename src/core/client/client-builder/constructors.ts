import { RouteTree } from "../../server/router/types";
import { Hooks } from "../../types/Hooks/Hooks";
import { ClientBuilder } from "./clientBuilder";

export const CleintBuilderConstructors  = {
     empty() {
        return new ClientBuilder(
            {
                "afterReceive": Hooks.empty(),
                "beforeSend": Hooks.empty(),
                "onErrored": Hooks.empty()
            },
            {
                retries: 3,
            },
            {}
        );
    },

    fromRouteTree(router: RouteTree) {
        return new ClientBuilder(
            {
                "afterReceive": Hooks.empty(),
                "beforeSend": Hooks.empty(),
                "onErrored": Hooks.empty()
            },
            {
                retries: 3,
            },
            router
        );
    }
}
