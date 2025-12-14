import { Hook, Hooks } from "../../types/Hooks/Hooks";

export type ClientHooks = {
    beforeSend: Hooks<Hook<string, (arg: unknown) => unknown>[]>
    afterReceive: Hooks<Hook<string, (arg: unknown) => unknown>[]>
    onErrored: Hooks<Hook<string, (arg: unknown) => unknown>[]>
};

export const cl = {
    beforeSend: Hooks.empty().add({name: "hi" as const, handler: v => "" as const}),
    onErrored: Hooks.empty(),
    afterReceive: Hooks.empty(),
} satisfies ClientHooks