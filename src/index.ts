import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Server } from "http";
import portastic from "portastic";
import { BackendBuilder } from "./BackendBuilder";

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

    // Sets PORT as a random port available in the range 29170 - 29998
    const ports = await portastic.find({ min: 29170, max: 29998 });
    const PORT = ports[Math.floor(Math.random() * 100)];

    const app = express();
    apolloServer.applyMiddleware({ app, path: "/graphql" });
    const server = app.listen({ port: PORT });

    const url = `http://localhost:${PORT}/graphql`;

    return { server, url };
  }
}
