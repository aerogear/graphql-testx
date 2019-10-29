import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Server } from "http";
import { BackendBuilder } from "./BackendBuilder";
import { getAvailablePort } from "./utils";

const defaultConfig = {
  create: true,
  update: true,
  findAll: true,
  find: true,
  delete: true,
  subCreate: false,
  subUpdate: false,
  subDelete: false,
  disableGen: false,
};

export class TestxServer {
  private schema: string;
  private server: Server;
  private serverUrl: string;

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start() {
    const { server, url } = await this.generateServer();

    this.server = server;
    this.serverUrl = url;
  }

  public close() {
    this.server.close();
  }

  public url() {
    return this.serverUrl;
  }

  private async generateServer() {
    const backendBuilder = new BackendBuilder(this.schema, defaultConfig);
    const { typeDefs, resolvers, dbConnection } = await backendBuilder.generateBackend();

    const context = async ({ req }: { req: express.Request }) => {
      return {
        req,
        db: dbConnection,
      };
    };

    const apolloServer = new ApolloServer({ typeDefs, resolvers, context });

    const port = await getAvailablePort();
    const app = express();
    apolloServer.applyMiddleware({ app, path: "/graphql" });
    const server = app.listen({ port });

    const url = `http://localhost:${port}/graphql`;

    return { server, url };
  }
}
