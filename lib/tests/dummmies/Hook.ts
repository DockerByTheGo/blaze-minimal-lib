import { HookBuilder } from "../../src/core/websocket/server/utilites/builders/HookBuilder";

export const hooks = HookBuilder.new().add({
    key: "hi",
    execute: v => ({ hi: "" } as const),
}).build();
