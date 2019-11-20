import { ApolloServer, PubSub } from "apollo-server-express";
import express from "express";
import {
  GraphQLBackendCreator,
  KnexDBDataProvider,
  UpdateDatabaseIfChanges
} from "graphback";
import { Server } from "http";
import Knex from "knex";
import tmp from "tmp";
import { Schema } from "./Schema";
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
  disableGen: false
};

export class TestxServer {
  private schema: Schema;
  private server: Server;
  private serverUrl: string;
  private dbConnection: Knex;

  constructor(schema: string) {
    this.schema = new Schema(schema);
  }

  public async start() {
    const { server, url } = await this.generateServer();

    this.server = server;
    this.serverUrl = url;
  }

  public close() {
    this.server.close();
    this.dbConnection.destroy();
  }

  public url() {
    return this.serverUrl;
  }

  private async generateServer() {
    // db
    const knex = Knex({
      client: "sqlite3",
      connection: { filename: ":memory:" }
    });
    const migrater = new UpdateDatabaseIfChanges(knex, tmp.dirSync().name);
    await migrater.init(this.schema.getSchemaText());

    // backend
    const backend = new GraphQLBackendCreator(this.schema, defaultConfig);
    const runtime = await backend.createRuntime(
      new KnexDBDataProvider(knex),
      new PubSub()
    );

    const apolloServer = new ApolloServer({
      typeDefs: runtime.schema,
      resolvers: runtime.resolvers
    });

    const port = await getAvailablePort();
    const app = express();
    apolloServer.applyMiddleware({ app, path: "/graphql" });
    const server = app.listen({ port });

    const url = `http://localhost:${port}/graphql`;

    return { server, url };
  }
}
