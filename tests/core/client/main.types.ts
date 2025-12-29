import { Client, ClientConstructors, Routes } from "../../../src/core/client/Client";
import { Config } from "../../../src/core/client/types/Config";
import { ClientHooks } from "../../../src/core/client/types/ClientHooks";
import { Hooks } from "../../../src/core/types/Hooks/Hooks";
import { RouteTree } from "../../../src/core/server/router/types";

// Test ClientConstructors
const constructors = new ClientConstructors();

// Test creating an empty client
const emptyClient = constructors.empty();
emptyClient satisfies Client<RouteTree>;

// Test Config type
const config: Config = {
    retries: 3,
};

const hooks: ClientHooks = {
    beforeSend: Hooks.empty(),
    afterReceive: Hooks.empty(),
    onErrored: Hooks.empty(),
};

const clientWithRoutes = constructors.fromRoutes({} as any);
clientWithRoutes satisfies Client<any>;

