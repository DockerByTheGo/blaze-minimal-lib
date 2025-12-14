import { Config } from "./types/Config";
import { ClientHooks } from "./types/ClientHooks";
import { Client } from "./types/Client";
import { RouteTree } from "../server/router/types";
import { ifAny } from "@blazyts/better-standard-library";
import { Hook, Hooks } from "../types/Hooks/Hooks";

export class CleintBuilderConstructors {
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
    }

    fromRouteTree(router: RouteTree){
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

export class ClientBuilder<
    TRouter extends RouteTree,
    THooks extends ClientHooks,
> {

    constructor(
        public hooks: THooks,
        private config: Config,
        protected router: TRouter
    ) { }

    hook<
        THookType extends keyof ClientHooks,
        THookName extends string,
        TReturn
    >(args: {
        name: THookName;
        type: THookType;
        handler: (v: THooks[THookType]["TGetLastHookReturnType"]) => TReturn;
    }): ClientBuilder<
        TRouter,
        THooks & { [K in THookType]: { handler: (v: THooks[THookType]["TGetLastHookReturnType"]) => TReturn } }
    > {
        this.hooks[args.name] = args;
        return this;
    }

    //TODO: make it so that if we add a certain header here it removes it from the requored parameters
    beforeSend<
        TReturn,
        TName extends string
    >(
        func: (arg: ifAny<THooks["beforeSend"]["TGetLastHookReturnType"], {}>) => TReturn,
        name: TName
    ): ClientBuilder<
        TRouter,
        THooks & {
            beforeSend: Hooks<[
                ...THooks["beforeSend"]["v"],
                Hook<TName, (func: ifAny<THooks["beforeSend"]["TGetLastHookReturnType"], {}>) => TReturn>
            ]>
        }
    > {

        this.hooks["beforeSend"].push(func);

        return this;

    }

    static new<Trouter extends RouteTree, TCleintHooks extends ClientHooks>(r: Trouter, h: TCleintHooks) {
        return new ClientBuilder<Trouter, TCleintHooks>(
            h,
            {
                retries: 3,
            },
            r
        );
    }


    static constructors = new CleintBuilderConstructors();

    createClient(): Client<TRouter> {
        return new Client(
            this.hooks,
            this.config,
            this.router
        )
    }
}

const routeTree = {
    "users": {
        "id": {
            "getLCientRepresentation": (arg: { body: {}, headers?: {} }) => { koko: "string" }
        }
    }
} satisfies RouteTree

// BBug: an empty client builder without prepopulated hooks doesnt have intellisense and widens the generic for the hooks 
const j = ClientBuilder
    .empty(routeTree)

    .beforeSend(v => { return { token: "xxx-xxx-xxx" } }, "addAuthToken")
    .beforeSend(v => { return { sessionId: "xxx-xxx-xxx" } }, "addSessionId")


const k = ClientBuilder
    .new(routeTree, {
        "afterReceive": Hooks.empty().add({ name: "jiji" as const, handler: v => " as const" as const }),
        "beforeSend": Hooks.empty().add({ name: "jiji" as const, handler: v => " as const" as const }),
        "onErrored": Hooks.empty()
    })
    .beforeSend(v => )