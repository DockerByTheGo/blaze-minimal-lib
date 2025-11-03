import { WebsocketUrl } from "../../../src/types/networking/urls/websocket";
import { wsRouter } from "./definition";

wsRouter.getCLientBuilder(new WebsocketUrl("ws://localhost:4000")).setupListeners({
    helloRoute: {
        sendHelloTheOtherListeners: {
            handler: async (v) => {
                console.log(v.message);
            },
        },
        sayByeToRestOfTheListeners: {
            handler: async (v) => {
                console.log(v);
            },
        },
    },
    userRoute: {
        deletedUser: {
            handler: async (v) => {
                v;
            },
        },
        invalidUserDetected: {
            handler: async (v) => {
                v;
            },
            unsafe: true,
        },
    },
});

// const wsClient = wsRouter.generateClient()

// console.log(await wsClient.helloRoute.newData({ message: ""}) )

// console.log(await wsClient.helloRoute.newNotification({
//   authToken: "abc",
//   data: {
//     metadata: "hello",
//     message: "world"
//   }
// }))

// console.log(await wsClient.userRoute.checkForInvalidUsersInRoom({
//   roomId: 1,
//   authKey: "k",
//   userId: 5
// }))
