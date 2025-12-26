import { Port } from "../../../utils/Port";

export interface ITransportLayerHandler{
    acceptConnections(port: Port): void
}