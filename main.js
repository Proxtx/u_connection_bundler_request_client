import { router, server } from "@proxtx/combine-rest";
import express from "express";
import config from "@proxtx/config";
import clientsRouter from "./clients.js";

const app = express();

app.use(express.json());

server.addModule("./../../../bundler.js", "bundler");
app.use("/api", router);
app.use("/clients", clientsRouter);

console.log("Server started. Port:", config.port);
app.listen(config.port);
