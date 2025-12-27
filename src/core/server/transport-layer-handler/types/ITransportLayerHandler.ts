import type { Port } from "../../../utils/Port";

export type ITransportLayerHandler = {
  acceptConnections: (port: Port) => void;
};
