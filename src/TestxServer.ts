import {
  initInMemoryDatabase,
  InMemoryDatabase,
  ImportData,
  DatabaseSchema
} from "./InMemoryDatabase";
import { initGraphbackServer, GraphbackServer } from "./GraphbackServer";
import { GraphQLBackendCreator } from "graphback";
import { GraphbackClient, initGraphbackClient } from "./GraphbackClient";
import { Server } from "http";
import { TestxApi, StringDic } from "./TestxApi";

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

export class TestxServer implements TestxApi {
  private schema: string;
  private creator?: GraphQLBackendCreator;
  private client?: GraphbackClient;
  private server?: GraphbackServer;
  private database?: InMemoryDatabase;

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start(): Promise<void> {
    await this.bootstrap();

    if (this.server === undefined) {
      // should be impossible until the bootstrap method create it
      throw new Error("server is undefined");
    }

    await this.server.start();
  }

  public async stop(): Promise<void> {
    if (this.server !== undefined) {
      await this.server.stop();
    }
  }

  public async close(): Promise<void> {
    await this.stop();

    if (this.database !== undefined) {
      await this.database.destroy();
    }

    this.server = undefined;
    this.database = undefined;
  }

  public async cleanDatabase(): Promise<void> {
    if (this.database !== undefined) {
      await this.database.clean();
    }
  }

  public async httpUrl(): Promise<string> {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the http url from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(this.server.getHttpUrl());
  }

  public async getGraphQlSchema(): Promise<string> {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the graphql schema from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(this.server.getSchema());
  }

  public async getDatabaseSchema(): Promise<DatabaseSchema> {
    if (this.database === undefined) {
      throw new Error(
        `can not retrieve database schema from undefined database, ` +
          `use bootstrap() or start() in order to initialize the database`
      );
    }

    return await this.database.getSchema();
  }

  public async setData(data: ImportData): Promise<void> {
    if (this.database === undefined) {
      throw new Error(
        `can not import data into undefined database, ` +
          `use bootstrap() or start() in order to initialize the database`
      );
    }

    await this.database.importData(data);
  }

  public async bootstrap(): Promise<void> {
    if (this.database === undefined) {
      this.database = await initInMemoryDatabase(this.schema);
    }

    if (this.creator === undefined) {
      this.creator = new GraphQLBackendCreator(this.schema, DEFAULT_CONFIG);
    }

    if (this.server === undefined) {
      this.server = await initGraphbackServer(
        this.creator,
        this.database.getProvider()
      );
    }

    if (this.client === undefined) {
      this.client = await initGraphbackClient(this.creator);
    }
  }

  public async getQueries(): Promise<StringDic> {
    if (this.client === undefined) {
      throw new Error(
        `can not retrieve client queries from undefined client, ` +
          `use bootstrap() or start() in order to initialize the client`
      );
    }

    return Promise.resolve(this.client.getQueries());
  }

  public async getMutations(): Promise<StringDic> {
    if (this.client === undefined) {
      throw new Error(
        `can not retrieve client mutations from undefined client, ` +
          `use bootstrap() or start() in order to initialize the client`
      );
    }

    return Promise.resolve(this.client.getMutations());
  }
}
