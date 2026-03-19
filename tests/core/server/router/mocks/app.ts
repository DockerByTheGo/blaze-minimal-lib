import { z } from "zod";

import { CustomWebSocketRouter } from "../../src/core/websocket/server/app";
import { HookBuilder } from "../../src/core/websocket/server/utilites/builders/HookBuilder";
import { pukiMessage } from "./Message";

export const router = new CustomWebSocketRouter({}).addChannel("channel-1", {
  hooks: {
    beforeHandle: {
      ordered: HookBuilder
        .new()
        .add({
          key: "lolo",
          execute: v => ({ hi: "" } as const),
        })
        .build(),
      independent: [],
    },
  },
  messagesItCanReceive: {
    puki: pukiMessage,
  } as const,
  messagesItCanSend: {
    puki: z.object({
      puki: z.string(),
    }),
  },
});
