import type { IRouteHandler, RequestData, RouteMAtcher } from "../index";

import { RouterObject } from "../index";

type UserRouteParams = {
  userId: string;
};

type ExampleRequestData = RequestData & {
  protocol: "GET";
};

type ExampleRequest = {
  reqData: ExampleRequestData;
  requestId: string;
  body: UserRouteParams;
};

type ExampleResponse = {
  body: {
    ok: true;
    userId: string;
    requestId: string;
  };
};

class UserRouteMatcher implements RouteMAtcher<UserRouteParams> {
  type = "example";
  TGetRouteString!: "/users/:userId";
  TGetContextType!: UserRouteParams;

  getRouteString() {
    return "/users/:userId";
  }

  match(path: string): UserRouteParams | undefined {
    const parts = path.split("/").filter(Boolean);
    if (parts.length !== 2 || parts[0] !== "users") {
      return undefined;
    }

    return { userId: parts[1] };
  }
}

const userRoute = new UserRouteMatcher();

const getUserHandler: IRouteHandler<ExampleRequest, ExampleResponse> = {
  metadata: {},
  getClientRepresentation() {
    return {
      description: "Return a JSON payload for a matched user route.",
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
      name: "attach-route-params-and-request-id",
      handler: (request) => {
        // The current router uses `getRouteString()` for registration,
        // so we normalize the matcher result here before the handler runs.
        const params = userRoute.match(request.reqData.url);
        if (!params) {
          throw new Error("Route params could not be resolved");
        }

        return {
          ...request,
          requestId: "req-demo-001",
          body: params,
        };
      },
    })
    .addRoute({
      routeMatcher: userRoute,
      protocol: "GET",
      handler: getUserHandler,
    });

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
