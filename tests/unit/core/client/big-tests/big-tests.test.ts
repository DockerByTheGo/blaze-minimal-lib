import { AppBuilder } from "../../../../../src/core/server/main";

const dummyApp =  AppBuilder
    .new()
    .post({name: "/route-1", handler: (args) => {
        args

        return "hi"
    }})
    .post({name: "/route-2", handler: (args) => {
        args

        return "hi2"
    }})



const dummyClient = dummyApp
    .createClientBuilder()
    .beforeSend((arg => ""))
    .beforeSend(arg => "")