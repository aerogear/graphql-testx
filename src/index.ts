import { ApolloServer } from "apollo-server";
import express from "express";
import { Server } from "http";
import { BackendBuilder } from "./BackendBuilder";
import Knex from "knex";

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
  private dbConnection: Knex;

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start() {
    const apolloServer = await this.generateServer();
    const { server, url } = await apolloServer.listen();
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
    const backendBuilder = new BackendBuilder(this.schema, defaultConfig);
    const { typeDefs, resolvers, dbConnection } = await backendBuilder.generateBackend();
    this.dbConnection = dbConnection;

    const context = async ({ req }: { req: express.Request }) => {
      return {
        req,
        db: dbConnection,
      };
    };

    const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
    return apolloServer;
  }
}
