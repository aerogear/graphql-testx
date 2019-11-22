import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { Server } from "http";
import Knex from "knex";
import knexCleaner from "knex-cleaner";
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
  private expressServer: Express;
  private dbConnection: Knex;

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start() {
    await this.bootstrap();
    const port = await getAvailablePort();
    this.server = this.expressServer.listen({ port });
    this.serverUrl = `http://localhost:${port}/graphql`;
  }

  public stop() {
    this.server.close();
  }

  public close() {
    this.stop();
    this.dbConnection.destroy();
    this.expressServer = null;
  }

  public async cleanDatabase() {
    await knexCleaner.clean(this.dbConnection);
  }

  public url() {
    return this.serverUrl;
  }

  public async bootstrap() {
    if(!this.expressServer) { 
      const { typeDefs, resolvers, dbConnection } = await this.generateBackend(); 
      const app = this.generateServer({ typeDefs, resolvers, dbConnection });
      this.dbConnection = dbConnection;
      this.expressServer = app;
    }
  }

  private async generateBackend() {
    const backendBuilder = new BackendBuilder(this.schema, defaultConfig);

    const {
      typeDefs,
      resolvers,
      dbConnection,
    } = await backendBuilder.generate();

    return { typeDefs, resolvers, dbConnection };
  }

  private generateServer({ typeDefs, resolvers, dbConnection }) {
    // eslint-disable-next-line @typescript-eslint/require-await
    const context = async ({ req }: { req: express.Request }) => {
      return {
        req,
        db: dbConnection,
      };
    };

    const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
    const app = express();
    apolloServer.applyMiddleware({ app, path: "/graphql" });

    return app;
  }
}
