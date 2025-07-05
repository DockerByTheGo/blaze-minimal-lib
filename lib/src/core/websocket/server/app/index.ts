import type { GetSet, keyofonlystringkeys, Last, Port, WebsocketUrl } from "@blazyts/better-standard-library";
import type { ZodObject, ZodRawShape } from "zod";

import { BetterArray, map, Optionable, panic } from "@blazyts/better-standard-library";
import { WebSocketServer } from "ws";

import type { ChannelConfig } from "../../types/Channel/main";
import type { BaseHookBundle, BaseMessageHooks, GlobalHooks, MessageHooks, ServerHooks } from "../../types/Hooks/main";
import type { MessageItCanReceive, MessageThatCanBeSent, TypedMessage } from "../../types/Message/main";

import { WebsocketClient } from "../../client";
import { runHookHandler } from "./helpers";

// ---------
// This is the core class with only domain/bussiness logic e.g. without any utilities like map pipe etc... to see them go below to CustomWebsocketRouter where they are implemented i decided
// --------

export type BaseChannelConfig = ChannelConfig<
    Record<string, ZodObject<ZodRawShape>>,
    Record<string, MessageItCanReceive<BaseMessageHooks, unknown>>,
    Partial<ServerHooks<BaseHookBundle, BaseHookBundle>>
>;



export class CustomWebSocketRouter<
    Channels extends Record<
        string,
        BaseChannelConfig
    >,
    Hooks extends GlobalHooks,
> {
    public readonly prefix: GetSet<Optionable<string>>;

    Prefix(prefix: string): (typeof this.prefix)["value"] extends string ? never : this { // this is because you cant set a second prefix to an instance // TODO mamke it so that in the future when you prefix it does not return an instance on which you can call prefix at all
        this.prefix.setV(new Optionable(prefix));
        return this;
    }

    protected context: Context = {} as Context; // make private later
    public readonly channels: Channels;
    public hooks: Optionable<Partial<GlobalHooks>> = new Optionable(null);

    constructor(endpoints: Channels, context?: Context, hooks: typeof this.hooks = new Optionable(null)) {
        this.channels = endpoints ?? ({} as Channels);
        this.hooks = hooks;
    }

    public hook<Hook extends (v: Parameters<Last<>>) => unknown>(h: Hook): CustomWebSocketRouter<Channels, Context, Hooks & Hook> {
        return new CustomWebSocketRouter(this.channels, this.context, this.hooks.setV(h));
    }

    block(handler: (v: this) => void){
        handler(this)
        return this.hook(v => v)
    }


    public plug<
        NewChannels extends Record<
            string,
            ChannelConfig<
                any,
                any,
                {
                    validate: ZodObject<ZodRawShape>;
                    validateResponse: ZodObject<ZodRawShape>;
                }
            >
        >,
        NewContext extends Record<string, unknown>,
    >(
        app: CustomWebSocketRouter<Channels, Context>,
    ): CustomWebSocketRouter<Channels & NewChannels, Context & NewContext> {
    // Merging logic can be added here if necessary
    // For example, copying handlers or other properties from `app` to this instance

        // Return a new instance of CustomWebSocketRouter
        return new CustomWebSocketRouter
        ({
            ...this.channels,
            ...app.channels,
        }, {
            ...this.context,
            ...app.context,
        });
    }

    private sendUnprocessableMessageType(
        ws: WebSocket,
        invocationInfo: { channel: string; msg: object; handler: string },
    ) {
        ws.send(
            JSON.stringify({
                error: "Cannot find handler to process message",
                invocationData: invocationInfo,
            }),
        );
    }

    private transformMsg(
        v: string,
    ): Optionable<
            TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
        > {
        try {
            return new Optionable(JSON.parse(v));
        }
        catch (e) {
            throw new Error(e.message);
            return new Optionable<
                TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
            >(null);
        }
    }

    store<T extends Record<string, unknown>>(
        object: T,
    ): CustomWebSocketRouter<
            Channels,
    Context & { [Key in keyof T]: T[Key] },
    Hooks
        > {
        return new CustomWebSocketRouter(this.channels, {
            ...this.context,
            ...object,
        });
    }

    start(port: Port) {
        const h = this.channels;

        const wss = new WebSocketServer({ port: port.value });
        Object.entries(this.channels).forEach(([channelName, channelConfig]) => {
            new Optionable(channelConfig)
                .ifCanBeUnpacked((handlers) => {
                    wss.on("connection", (ws, req) => {
                        this.hooks.ifCanBeUnpacked(({ onConnection }) => {
                            runHookHandler(onConnection, { ws, message: req });
                        });

                        ws.on("message", async (message) => {
                            // TODO: Add a hook here to intercept message pre-parsing
                            console.log("mgfg", message.toString());
                            this.transformMsg(message.toString())
                                .tick(v => console.log("parsed message"))
                                .try({
                                    ifNone: () => {
                                        this.sendUnprocessableMessageType(ws, {
                                            channel: "unknown",
                                            handler: "onMessageReceived",
                                            msg: {},
                                        });
                                    },

                                    ifNotNone: async (parsedMessage) => {
                                        try {
                                            this.hooks.ifCanBeUnpacked(({ beforeHandle }) => {
                                                map(beforeHandle, (hook) => {
                                                    runHookHandler(hook, { ws, message: parsedMessage });
                                                });
                                            });
                                            new Optionable(
                                                BetterArray
                                                    .new(Object.entries(this.channels))
                                                    .tick(v => v)
                                                    .filter(([channelName]) => channelName === parsedMessage.channel)
                                                    .at(0),
                                            ).try({
                                                ifNone: () =>
                                                    console.log(`No open channel called ${parsedMessage.channel}`, parsedMessage),

                                                ifNotNone: ([channelName, channelConfig]) => {
                                                    new Optionable(
                                                        channelConfig.messagesItCanReceive[parsedMessage.message],
                                                    ).try({
                                                        ifNone: () =>
                                                            console.log(`Channel ${channelName} does not accept message type ${parsedMessage.message}`),

                                                        ifNotNone: ({ config }) => {
                                                            map(config, ({ handler, hooks: { beforeHandler, afterHandler } }) => {
                                                                map(runHookHandler(beforeHandler, { ws, message: parsedMessage }), (result) => {
                                                                    console.log("passing received", parsedMessage);
                                                                    map(handler(result), (result) => {
                                                                        map(runHookHandler(afterHandler, { ws, message: result }), (result) => {
                                                                            this.hooks.ifCanBeUnpacked(({ afterHandle }) => {
                                                                                map(afterHandle, (hook) => {
                                                                                    runHookHandler(hook, { ws, msg: result });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        },
                                                    });
                                                },
                                            });
                                        }
                                        catch (err) {
                                            console.log(err);
                                            this.hooks.ifCanBeUnpacked(({ onError }) => onError(err));
                                        }
                                    },
                                });
                        });

                        ws.on("close", (code, reason) => {
                            this.hooks.ifCanBeUnpacked(({ onClose }) => {
                                runHookHandler(onClose, {
                                    ws,
                                    message: { code, reason: reason.toString() },
                                });
                            });
                        });
                    });
                });
        });
    }

    getCLientBuilder(url: WebsocketUrl) {
        return new WebsocketClient<Channels, {}>(url, this.channels);
    }

    // it hahves like elysia plugins
    // usefull for adding big batches of context for example e,g, a big store which you have reused previously, for example all of services for interacting with a auth provider which you are reusing
    get(){}
    post(){}
    options(){}

    addChannel<
    // Config extends { name:  string }, // try putting the  below generic here for a bit more cleannes
        NewName extends string,
        NewChannel extends ChannelConfig<
            Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
            Record<
                string,
                MessageItCanReceive<
                    BaseMessageHooks,
                    unknown
                >
            >,
            Partial<ServerHooks<
                BaseHookBundle,
                BaseHookBundle,
                string
            >>
        >,
    >(name: NewName,
        config: NewChannel,
    ): NewName extends keyof Channels
            ? never
            : CustomWebSocketRouter<
      Channels & Record<NewName, NewChannel>,
                Context,
                Hooks
            > {
        Object.entries(this.channels).forEach(([channelName, value]) => {
            if (channelName === name) {
                panic(`Channel ${channelName} is already defined`);
            }
        });
        return new CustomWebSocketRouter(
            {
                ...this.channels,
                [name as NewName]: { ...config },
            },
            this.context,
        );
    }
}
