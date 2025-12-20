import { ClientBuilder } from "../../../src/core/client/client-builder/clientBuilder";
import { CleintBuilderConstructors } from "../../../src/core/client/client-builder/constructors";
{
        "afterReceive": Hooks.empty().add({ name: "jiji" as const, handler: v => " as const" as const }),
        "beforeSend": Hooks.empty().add({ name: "jiji" as const, handler: v => " as const" as const }),
        "onErrored": Hooks.empty()
    }

// BBug: an empty client builder without prepopulated hooks doesnt have intellisense and widens the generic for the hooks 


const router = satisfies 

const k = CleintBuilderConstructors.fromRouteTree()