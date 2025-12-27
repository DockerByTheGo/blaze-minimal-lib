import type { RouterObject } from "../router/Router";
import type { ITransportLayerHandler } from "./types";

import { Port } from "../../utils/Port";

class Server implements ITransportLayerHandler {
  acceptConnections(port: Port = new Port(3000)) {
    Bun.serve({
      port: port.port,
      fetch: (req) => {
        this.router.route(new RequestObjectHelpe(req));
      },
      websocket: {},
    });
  }

  constructor(public readonly router: RouterObject<any, any>) {

  }
}
