import type { IRouteHandler, RequestData, RouteMAtcher } from "../index";

import { RouterObject } from "../index";

type UserRouteContext = {
  userId: string;
};

type ExampleRequestData = RequestData & {
  protocol: "GET";
};

type ExampleRequest = {
  reqData: ExampleRequestData;
  requestId: string;
};

type ExampleResponse = {
  body: {
    ok: true;
    userId: string;
    requestId: string;
  };
  meta?: {
    servedBy: string;
  };
};

class UserRouteMatcher implements RouteMAtcher<UserRouteContext> {
  type = "example";
  TGetRouteString!: "/users/:userId";
  TGetContextType!: UserRouteContext;

  getRouteString() {
    return "/users/:userId";
  }

  match(path: string): UserRouteContext | undefined {
    const [, usersSegment, userId] = path.split("/");
    if (usersSegment !== "users" || !userId) {
      return undefined;
    }

    return { userId };
  }
}

const getUserHandler: IRouteHandler<
  {
    body: UserRouteContext;
    reqData: ExampleRequestData;
    requestId: string;
  },
  ExampleResponse
> = {
  metadata: {},
  getClientRepresentation() {
    return {
      description: "Returns a simple JSON payload for a user route.",
    };
  },
  handleRequest(request) {
    return {
      body: {
        ok: true,
        userId: request.body.userId,
        requestId: request.requestId,
      },
    };
  },
};

async function main() {
  const router = RouterObject
    .empty()
    .beforeHandler({
      name: "attach-request-id",
      handler: request => ({
        ...request,
        requestId: "req-demo-001",
      }),
    })
    .addRoute({
      protocol: "GET",
      routeMatcher: new UserRouteMatcher(),
      hooks: {},
      handler: getUserHandler,
    })
    .afterHandler("attach-metadata", response => ({
      ...response,
      meta: {
        servedBy: "blaze-minimal-lib",
      },
    }));

  const response = await router.route({
    reqData: {
      url: "users/42",
      headers: {},
      body: {},
      protocol: "GET",
    },
  } as ExampleRequest);

  console.log(JSON.stringify(response, null, 2));
}

void main();
