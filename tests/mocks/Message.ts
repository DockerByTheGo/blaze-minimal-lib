import { LOG } from "@blazyts/better-standard-library";
import { HookBuilder } from "../../src/core/websocket/server/utilites/builders/HookBuilder";
import { hooks } from "./Hook";

export const msg = new MessageThatCanBeReceivedBuilder(
  {
    beforeHandler: {
      ordered: hooks,
      independent: [],
    },
    afterHandler: {
      ordered: hooks,
      independent: [],
    },
    onErrorr: () => "" as const,
  },
  (v) => {
    return {
      ...v,
      koko: "",
    };
  },
);

export const pukiMessage = new MessageThatCanBeReceivedBuilder(
  {
    afterHandler: {
      ordered: HookBuilder
        .new()
        .add({
          key: "ojjoi" as const,
          execute: v => ({ ko: "" }),
        })
        .build(),
      independent: [],
    } as const,
    beforeHandler: {
      ordered: HookBuilder.new()
        .add({
          key: "iooi" as const,
          execute: v => ({ lolo: "" } as const),
        } as const)
        .build(),
      independent: [],
    } as const,
    onErrorr: v => "",
  },
  (v) => { },
).build();

export const newTrainData = new MessageThatCanBeReceivedBuilder(
  {
    afterHandler: {
      ordered: HookBuilder
        .new()
        .add({
          key: "ojjoi" as const,
          execute: v => ({ ko: "" }),
        })
        .build(),
      independent: [],
    } as const,
    beforeHandler: {
      ordered: HookBuilder.new()
        .add({
          key: "iooi" as const,
          execute: v => ({ lolo: "" } as const),
        } as const)
        .build(),
      independent: [],
    } as const,
    onErrorr: v => "",
  },
  (v) => { LOG("ko"); },
).build();
