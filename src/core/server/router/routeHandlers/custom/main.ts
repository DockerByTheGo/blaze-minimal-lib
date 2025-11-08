import { Optionable } from "@blazyts/better-standard-library";
/*

if it returns nullable optionable it means that the route is not matching
*/
class Custom<ctxProviderReturn> {
    constructor(private ctxProvider: (path: string) =>  Optionable<ctxProviderReturn>) {}
}



// Exampe 
const custom = new Custom((path) => {
    if(path.indexOf("/api") !== 0) return Optionable.none()
    return Optionable.new({userId: path.split("/")[2]})
})
    