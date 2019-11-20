import { ApolloServer, PubSub } from "apollo-server-express";
import newExpress from "express";
import { Express } from "express-serve-static-core";
import { GraphbackDataProvider, GraphQLBackendCreator } from "graphback";
import { Server } from "http";
import { GraphbackSchema } from "./GraphbackSchema";
import { getAvailablePort } from "./utils";

const DEFAULT_CONFIG = {
  create: true,
  update: true,
  findAll: true,
  find: true,
  delete: true,
  subCreate: false,
  subUpdate: false,
  subDelete: false,
  disableGen: false
};

const ENDPOINT = "/graphql";

export class ExpressServer {
  private express: Express;
  private server: Server;
  private httpUrl: string;

  constructor() {
    this.express = newExpress();
  }

  public async init(schema: GraphbackSchema, provider: GraphbackDataProvider) {
    const backend = new GraphQLBackendCreator(schema, DEFAULT_CONFIG);
    const runtime = await backend.createRuntime(provider, new PubSub());

    const apolloServer = new ApolloServer({
      typeDefs: runtime.schema,
      resolvers: runtime.resolvers
    });

    apolloServer.applyMiddleware({ app: this.express, path: ENDPOINT });
  }

  public async start(port?: number) {
    if (port === undefined) {
      port = await getAvailablePort();
    }

    this.server = this.express.listen({ port });
    this.httpUrl = `http://localhost:${port}${ENDPOINT}`;
  }

  public async stop() {
    // convert server close to a promise
    await new Promise((resolve, reject) => {
      this.server.close(e => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  public getHttpUrl(): string {
    return this.httpUrl;
  }
}
