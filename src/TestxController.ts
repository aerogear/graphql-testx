import { TestxServer } from "./TestxServer";
import { Server } from "http";
import express, { json } from "express";
import { isTestxApiMethod } from "./TestxApi";
import { getAvailablePort } from "./utils";
import cors from "cors";

type UnknownFunction = (...args: unknown[]) => unknown;

export class TestxController {
  private testxServer: TestxServer;
  private controllerServer?: Server;
  private controllerPort?: number;

  constructor(server: TestxServer) {
    this.testxServer = server;
  }

  public async start(): Promise<void> {
    const app = express();
    app.use(json());
    app.use(cors());

    app.post("/", (req, res) => {
      if (req.body === undefined) {
        res.status(500).send("Error: body is undefined");
        return;
      }

      if (req.body.name === undefined) {
        res.status(500).send("Error: no method name passed");
        return;
      }

      const name = req.body.name;
      if (!isTestxApiMethod(name)) {
        res.status(500).send(`Error: ${name} is not a TestxApi method`);
        return;
      }

      // cast method to unknown
      const method = this.testxServer[name].bind(
        this.testxServer
      ) as UnknownFunction;

      // execute the api method
      const result = method(...(req.body.args || []));

      // cast to promise no matter what it is
      Promise.resolve(result).then(
        r => {
          res.json(r);
        },
        e => {
          console.error(e);
          res.status(500).send(`Unknown Error: ${e}`);
        }
      );
    });

    this.controllerPort = await getAvailablePort();
    this.controllerServer = app.listen(this.controllerPort);
  }

  public async close(): Promise<void> {
    // close the director server
    await new Promise(resolve => {
      if (this.controllerServer) {
        this.controllerServer.close(() => {
          resolve();
        });
      }
    });

    // also close the testx server
    await this.testxServer.close();
  }

  public async httpUrl(): Promise<string> {
    if (this.controllerPort === undefined) {
      throw new Error(
        `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(`http://localhost:${this.controllerPort}`);
  }
}
