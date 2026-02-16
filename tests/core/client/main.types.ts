import { Client, ClientConstructors, Routes } from "../../../../blazy-edge/docs/components/client/Client";
import { Config } from "../../../../blazy-edge/docs/components/client/types/Config";
import { ClientHooks } from "../../../../blazy-edge/docs/components/client/types/ClientHooks";
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

const clientWithRoutes = constructors.fromRoutes({} as any);
clientWithRoutes satisfies Client<any>;

