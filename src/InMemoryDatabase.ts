import {
  DropCreateDatabaseAlways,
  GraphbackDataProvider,
  KnexDBDataProvider,
  migrate
} from "graphback";
import Knex from "knex";
import { GraphbackSchema } from "./GraphbackSchema";

export class InMemoryDatabase {
  private connection: Knex;
  private provider: GraphbackDataProvider;

  /**
   * Create a new sqlite3 in-memory database
   */
  constructor() {
    this.connection = Knex({
      client: "sqlite3",
      connection: { filename: ":memory:" }
    });

    this.provider = new KnexDBDataProvider(this.connection);
  }

  /**
   * Initialize the database schema
   *
   * @param schema Graphback Schema/Data Model
   */
  public async init(schema: GraphbackSchema): Promise<void> {
    const strategy = new DropCreateDatabaseAlways("sqlite3", this.connection);
    await migrate(schema.getSchemaText(), strategy);
  }

  /**
   * Destroy the database
   */
  public async destroy() {
    await this.connection.destroy();
  }

  /**
   * Return the Graphback provider for this database
   */
  public getProvider(): GraphbackDataProvider {
    return this.provider;
  }
}
