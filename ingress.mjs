import polka from "polka";

import configure from "./configure.mjs";
import { assignTargetDomain, reverseProxy } from "./handlers.mjs";

const PORT = process.env.PORT || 3000;

const domainList = configure();

//  GET  HEAD  PATCH  OPTIONS  CONNECT  DELETE  TRACE  POST  PUT
const start = () =>
  polka()
    .use(assignTargetDomain(domainList))
    .get("/*", reverseProxy)
    .head("/*", reverseProxy)
    .patch("/*", reverseProxy)
    .options("/*", reverseProxy)
    .connect("/*", reverseProxy)
    .delete("/*", reverseProxy)
    .trace("/*", reverseProxy)
    .post("/*", reverseProxy)
    .put("/*", reverseProxy)
    .listen(PORT, err => {
      if (err) throw err;
      console.log(`> 🏃‍: Running on localhost:${PORT}`);
      console.log("ingress is starting with config: ", domainList);
    });

export default start;
