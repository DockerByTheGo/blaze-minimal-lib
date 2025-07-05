import type { URecord, With } from "@blazyts/better-standard-library";
import type { WebSocket } from "bun";

// -------------------------------------
// Utility Types
// -------------------------------------

export type WithKey<T extends URecord> = With<T, "key", string>;
// -------------------------------------
// Message & Channel Types
// -------------------------------------
// -------------------------------------
// Hook Types
// -------------------------------------

export type TypeSafeWebsocket<
    MessagesItCanSend = Record<string, unknown>,
> = {
    raw: WebSocket;
    safe: WebSocket & {
        send: {
            [Key in keyof MessagesItCanSend]: (v: MessagesItCanSend[Key]) => void
        };
    };
};
