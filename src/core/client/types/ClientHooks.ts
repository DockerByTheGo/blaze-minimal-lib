import { Hook, Hooks } from "../../types/Hooks/Hooks";



export type ClientHooks = {
    beforeSend: Hooks<Hook<string, (arg: unknown) => unknown>[]>
    afterReceive: Hooks<Hook<string, (arg: unknown) => unknown>[]>
    onErrored: Hooks<Hook<string, (arg: unknown) => unknown>[]>
};

