import { Hook, Hooks } from "../../../../types/Hooks/Hooks";

export type RouterHooks = {
  beforeRequest: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
  afterRequest: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
};