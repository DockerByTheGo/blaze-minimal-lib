import type { Alphabet, ContainsAtTheEnd, ContainsAtTheStart, RemoveNonAlphabetic } from "./utils";

export type InferParamType<Param extends string> =
  ContainsAtTheEnd<Param, "$"> extends true
    ? number
    : ContainsAtTheEnd<Param, "("> extends true
      ? Date
      : ContainsAtTheEnd<Param, "^"> extends true
        ? boolean
        : string;





