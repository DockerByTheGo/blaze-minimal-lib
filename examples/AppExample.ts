// why use app?

import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { z } from "zod";

import { App, ResponseStatus } from "../src/app";
import { ApiPath } from "../src/types/apiApth";

// well the webRouter part is supposed to a self contained piece so that it can be plugged into existing express apps. However it lacks some things so App is going one above it and providing some utilities like openapi tracking and also stacking contexts

const app = new App({ hi: "" });

const userRouter = app.createChildRouter(new ApiPath("/users"), { f: "" });

userRouter.get(
  "l",
  {
    body: z.object({}),
    params: z.object({}),
    responses: z.object({}),
  },

  async (req, res, next, ctx) => {
    ctx.f;
    ctx.hi;
    // also since we use app we also have ACCESS to the parent context
    return {
      status: new ResponseStatus(200),
      data: { message: "hello world" },
    };
  },
  {
    description: new Optionable("Get user list"),
  },
);
