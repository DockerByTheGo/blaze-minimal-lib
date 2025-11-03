import { Config } from "./types/Config";
import { ClientHooks } from "./types/ClientHooks";
import { GetLastHookReturnType } from "../types/Hooks/GetLastHooks";
import { Client } from "./types/Client";
import { Router } from "../server/types/router/Router";

export class ClientBuilder<
    TRouter extends Router,
    THooks extends ClientHooks
> {
    constructor(
        private hooks: THooks,
        private config: Config,
        protected router: TRouter
    ){}

    hook<
        THookType extends keyof ClientHooks,
        THookName extends string,
        TReturn
    >(args: {
        name: THookName;
        type: THookType;
        handler: (v: GetLastHookReturnType<THooks[THookType]>) => TReturn;
    }): ClientBuilder<
        TRouter,
        THooks & { [K in THookType]: { handler: (v: GetLastHookReturnType<THooks[THookType]>) => TReturn } }
    > {
        this.hooks[args.name] = args;
        return this;
    }
    
    beforeSend< // make it so that if we add a certain header here it removes it from the requored parameters
        TReturn
    >(
        func: (arg: GetLastHookReturnType<THooks["beforeSend"]>) => TReturn
    ): ClientBuilder<
        TRouter,
        THooks & { beforeSend: { handler: (arg: GetLastHookReturnType<THooks["beforeSend"]>) => TReturn } }
    > {
        this.hooks["beforeSend"].push(func);

        return this;
    }

    static new<TRouter extends Router>(router: TRouter){
        return new ClientBuilder<
            TRouter,
            ClientHooks
        >(
            {
                "afterReceive": [],
                "beforeSend": [],
                "onErrored": []
            }, 
            {
                retries: 3,
            },
            router
        );
    }

    createClient(): Client<TRouter> {
        return new Client(
            this.hooks,
            this.config,
            this.router
        )
    }
}

