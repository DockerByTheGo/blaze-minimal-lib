import { WebsocketUrl } from "../../../src/types/networking/urls/websocket";
import { wsRouter } from "./definition";

const client = wsRouter
  .getCLientBuilder(new WebsocketUrl("ws://localhost:4000"));

client.generateClient()

  .helloRoute
  .newData({
    message:
    "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
  });
