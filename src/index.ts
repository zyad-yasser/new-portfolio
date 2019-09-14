const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
import express = require("express");
import config from 'react-reveal/globals';
(async () => {
  try {
    const port = process.env.PORT || 15000;
    await app.prepare();
    const server = express();
    config({ ssrFadeout: true });
    server.get("/", (req, res) => {
      const actualPage = "/app.component";
      const queryParams = {};
      app.render(req, res, actualPage, queryParams);
    });
    server.get("*", (req, res) => handle(req, res));
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}!`)
    );
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
})();
