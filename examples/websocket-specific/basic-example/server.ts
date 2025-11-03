import { Port } from "../../../src/types/networking/port";
import { WebsocketUrl } from "../../../src/types/networking/urls/websocket";
import { wsRouter } from "./definition";

wsRouter.getCLientBuilder(new WebsocketUrl("ws://localhost:4000")).generateClient();

// make this example so that it alerts

wsRouter
    .implement(
        {
            helloRoute: {
                newData: (v) => {
                    console.log("g", v.message);
                },
                newNotification: (v) => {
                    v.data.message;
                },
            },
            userRoute: {
                checkForInvalidUsersInRoom: (v) => {},
                deleteUser: (v) => {},
            },
        },
    );

wsRouter.start(new Port(4000));
