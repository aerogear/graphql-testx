import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Server } from "http";
import { BackendBuilder } from "./BackendBuilder";
import { getAvailablePort } from "./utils";
import knexCleaner from "knex-cleaner";

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
  private backendContext: { [id: string]: any };

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start() {
    if (!this.backendContext) { await this.generateBackend() }
    await this.generateServer();
  }
  
  public stop() {
    this.server.close();
  }

  public close() {
    this.stop();
    this.backendContext.dbConnection.destroy();
    this.backendContext = null;
  }

  public async cleanDatabase() {
    await knexCleaner.clean(this.backendContext.dbConnection);
  }

  public url() {
    return this.serverUrl;
  }

  private async generateBackend() {
    const backendBuilder = new BackendBuilder(this.schema, defaultConfig);

    const {
      typeDefs,
      resolvers,
      dbConnection,
    } = await backendBuilder.generate();

    this.backendContext = { typeDefs, resolvers, dbConnection };
  }

  private async generateServer() {
    const { typeDefs, resolvers, dbConnection } = this.backendContext;

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

    this.server = app.listen({ port });
    this.serverUrl = `http://localhost:${port}/graphql`;
  }
}
