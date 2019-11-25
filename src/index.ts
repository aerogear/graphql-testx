import {
  initInMemoryDatabase,
  InMemoryDatabase,
  ImportData,
  DatabaseSchema
} from "./InMemoryDatabase";
import { initGraphbackServer, GraphbackServer } from "./GraphbackServer";
import { GraphbackSchema } from "./GraphbackSchema";
import { ColumnInfo } from "knex";

export class TestxServer {
  private schema: GraphbackSchema;
  private server?: GraphbackServer;
  private database?: InMemoryDatabase;

  constructor(schema: string) {
    this.schema = new GraphbackSchema(schema);
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

  public url(): string {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the http url from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return this.server.getHttpUrl();
  }

  public getGraphQlSchema(): string {
    if (this.server === undefined) {
      throw new Error(
        `can not retrieve the graphql schema from undefined server, ` +
          `use bootstrap() or start() in order to initialize the server`
      );
    }

    return this.server.getSchema();
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

    if (this.server === undefined) {
      this.server = await initGraphbackServer(
        this.schema,
        this.database.getProvider()
      );
    }
  }

  public getQueries() {
    return {
      findAllItems: `
        query findAllItems {
          findAllItems {
            id
            title
          }
        }
      `
    };
  }

  public getMutations() {
    // @ts-ignore
    return this.mutations;
  }
}
