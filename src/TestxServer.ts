import { initInMemoryDatabase, InMemoryDatabase } from "./InMemoryDatabase";
import { initGraphbackServer, GraphbackServer } from "./GraphbackServer";
import { GraphQLBackendCreator } from "graphback";
import { GraphbackClient, initGraphbackClient } from "./GraphbackClient";
import { TestxApi, StringDic } from "./TestxApi";
import { DatabaseSchema, ImportData } from "./generics";

/**
 * Graphback configuration for generating the graphql resolvers.
 * @constant
 */
const DEFAULT_CONFIG = {
  create: true,
  update: true,
  findAll: true,
  find: true,
  delete: true,
  subCreate: true,
  subUpdate: true,
  subDelete: true,
  disableGen: false
};

/**
 * Describes a TestxServer. A TestxServer generates a GraphQL server from a data
 * model with the resolvers, mutations, type defs and connection with a real
 * in-memory database, and exposes it in a url.
 *
 * @example
 * const server = new TestxServer(`
 * type Item {
 *   id: ID!
 *   name: String
 *   title: String!
 * }`);
 * await server.start();
 * console.log(`Running on ${server.url()}`);
 * server.close();
 */
export class TestxServer implements TestxApi {
  private schema: string;
  private creator?: GraphQLBackendCreator;
  private client?: GraphbackClient;
  private server?: GraphbackServer;
  private database?: InMemoryDatabase;

  /**
   * Create a TestxServer.
   * @param {string} schema - The Grahpback data model definition
   * @see {@link https://graphback.dev/docs/datamodel|Grahpback data model definition}
   */
  constructor(schema: string) {
    this.schema = schema;
  }

  /**
   * Executes the bootstrap() method to generate the GraphQL backend and initialize
   * the server.
   * Starts the GraphQL server exposing it in http://localhost:port/graphql,
   * the port is generated in the range 29170 - 29998.
   * The full url server can be retrieved by url() method after the server starts.
   */
  public async start(): Promise<void> {
    await this.bootstrap();

    if (this.server === undefined) {
      // should be impossible until the bootstrap method create it
      throw new Error("server is undefined");
    }

    await this.server.start();
  }

  /**
   * Stops the server to receive requests, but keeps the generated GraphQL backend
   * and database connection.
   * The server can be resumed with the stored GraphQL backend and database
   * connection by using start() method.
   */
  public async stop(): Promise<void> {
    if (this.server !== undefined) {
      await this.server.stop();
    }
  }

  /**
   * Close and destroy, the GraphQl server and the database.
   */
  public async close(): Promise<void> {
    await this.stop();

    if (this.database !== undefined) {
      await this.database.destroy();
    }

    this.server = undefined;
    this.database = undefined;
  }

  /**
   * Clears all database data.
   */
  public async cleanDatabase(): Promise<void> {
    if (this.database !== undefined) {
      await this.database.clean();
    }
  }

  /**
   * Get the server URL.
   * This URL is used to make basic queries and mutations.
   */
  public async httpUrl(): Promise<string> {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the http url from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(this.server.getHttpUrl());
  }

  /**
   * Get the subscriptions URL.
   * This URL is used to make subscription queries.
   */
  public async wsUrl(): Promise<string> {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the subscriptions url from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(this.server.getWsUrl());
  }

  /**
   * Get the generated GraphQL schema.
   * Only returns the GraphQL schema if it's called after using bootstrap() or
   * start() methods.
   */
  public async getGraphQlSchema(): Promise<string> {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the graphql schema from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return Promise.resolve(this.server.getSchema());
  }

  /**
   * Get the generated database schema.
   * Only returns the database schema if it's called after using bootstrap() or
   * start() methods.
   * @return {Object} An object containing the name of the tables as properties, each property has as value the info about the corresponding table
   */
  public async getDatabaseSchema(): Promise<DatabaseSchema> {
    if (this.database === undefined) {
      throw new Error(
        `can not retrieve database schema from undefined database, ` +
          `use bootstrap() or start() in order to initialize the database`
      );
    }

    return await this.database.getSchema();
  }

  /**
   * Inserts the data directly in the database.
   * Which means that the data doesn't pass through any mutation.
   * @param {Object[]} data - Data to insert
   */
  public async setData(data: ImportData): Promise<void> {
    if (this.database === undefined) {
      throw new Error(
        `can not import data into undefined database, ` +
          `use bootstrap() or start() in order to initialize the database`
      );
    }

    await this.database.importData(data);
  }

  /**
   * Bootstraps the TestxServer, generating the GraphQL backend with the
   * database connection, client queries and mutations and filling in some
   * properties needed to start the server.
   */
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

  /**
   * Get the generated client queries.
   * @return {Object} An object containing the queries as properties
   */
  public async getQueries(): Promise<StringDic> {
    if (this.client === undefined) {
      throw new Error(
        `can not retrieve client queries from undefined client, ` +
          `use bootstrap() or start() in order to initialize the client`
      );
    }

    return Promise.resolve(this.client.getQueries());
  }

  /**
   * Get the generated client mutations.
   * @return {Object} An object containing the mutations as properties
   */
  public async getMutations(): Promise<StringDic> {
    if (this.client === undefined) {
      throw new Error(
        `can not retrieve client mutations from undefined client, ` +
          `use bootstrap() or start() in order to initialize the client`
      );
    }

    return Promise.resolve(this.client.getMutations());
  }


    /**
   * Get the generated client subscriptions.
   * @return {Object} An object containing the subscriptions as properties
   */
  public async getSubscriptions(): Promise<StringDic> {
    if (this.client === undefined) {
      throw new Error(
        `can not retrieve client subscriptions from undefined client, ` +
          `use bootstrap() or start() in order to initialize the client`
      );
    }

    return Promise.resolve(this.client.getSubscriptions());
  }
}
