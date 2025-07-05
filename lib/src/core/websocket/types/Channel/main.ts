import type { ZodObject, ZodRawShape } from "zod";

import type { BaseHookBundle, BaseMessageHooks, ServerHooks } from "../Hooks/main";
import type { MessageItCanReceive, MessageThatCanBeSent } from "../Message/main";

export type ChannelConfig<
    MessagesItCanSend extends Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
    MessagesItCanReceive extends Record<
        string,
        MessageItCanReceive<
            BaseMessageHooks,
            unknown
        >
    >,
    Hooks extends Partial<ServerHooks<
        BaseHookBundle,
        BaseHookBundle,
        string
    >>,
> = {
    messagesItCanReceive: MessagesItCanReceive;
    messagesItCanSend: MessagesItCanSend;
    hooks: Hooks;
};
