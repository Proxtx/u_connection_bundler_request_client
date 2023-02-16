import { Router } from "express";
import config from "@proxtx/config";

let router = Router();

export let clients = {};

router.post("/register", (req, res) => {
  if (req.body.id && req.body.key && req.body.services) {
    clients[req.body.id] = new Client(req.body);
    res.status(200).send({ success: true });
  } else res.status(200).send({ success: false });
});

router.post("/pull", (req, res) => {
  if (!clients[req.body.id]) res.status(200).send({ success: false });
  else res.status(200).send(clients[req.body.id].getResponses(req.body));
});

class Client {
  constructor(register) {
    this.register = register;
    this.signal = Date.now();
    this.requests = [];
  }

  isDead() {
    return Date.now() - this.signal > config.signalInterval;
  }

  async sendRequest(request) {
    let response = { id: request.id, result: true };
    if (request.service == "core") {
      if (request.data.export == "key") response.result = this.register.key;
      if (request.data.export == "id") response.result = this.register.id;
      if (request.data.export == "services")
        response.result = this.register.services;
    } else this.requests.push(request);
    return response;
  }

  getResponses(request) {
    if (request.key != this.register.key) return { success: false };
    this.signal = Date.now();
    let requests = this.requests;
    this.requests = [];
    return { success: true, requests };
  }
}

export default router;

const clearClients = () => {
  for (let client in clients)
    if (clients[client].isDead()) delete clients[client];
  setTimeout(() => {
    clearClients();
  }, 5000);
};

clearClients();
