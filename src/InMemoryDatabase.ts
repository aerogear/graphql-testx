import Knex from "knex";
import {
  KnexDBDataProvider,
  DropCreateDatabaseAlways,
  migrate,
  GraphbackDataProvider
} from "graphback";
import { GraphbackSchema } from "./GraphbackSchema";
import knexCleaner from "knex-cleaner";

export interface ImportData {
  [table: string]: {
    [column: string]: unknown;
  };
}

export interface DatabaseSchema {
  [table: string]: string[];
}

export class InMemoryDatabase {
  private knex: Knex;
  private provider: KnexDBDataProvider;

  constructor(knex: Knex) {
    this.knex = knex;
    this.provider = new KnexDBDataProvider(knex);
  }

  /**
   * Destroy the database
   */
  public async destroy(): Promise<void> {
    await this.knex.destroy();
  }

  /**
   * Return the Graphback provider for this database
   */
  public getProvider(): GraphbackDataProvider {
    return this.provider;
  }

  public async clean(): Promise<void> {
    await knexCleaner.clean(this.knex);
  }

  public async getSchema(): Promise<DatabaseSchema> {
    const tables = await this.getTables();
    const schema: DatabaseSchema = {};
    for (const table of tables) {
      schema[table] = Object.keys(await this.knex(table).columnInfo());
    }
    return schema;
  }

  public async importData(data: ImportData): Promise<void> {
    const tables = await this.getTables();
    for (const table of tables) {
      if (data[table]) {
        await this.knex(table).insert(data[table]);
      }
    }
  }

  private async getTables(): Promise<string[]> {
    return (await this.knex("sqlite_master").where("type", "table"))
      .map(x => x.name)
      .filter(x => !x.includes("sqlite"));
  }
}

export async function initInMemoryDatabase(
  schema: GraphbackSchema
): Promise<InMemoryDatabase> {
  // initialize the knex db
  const knex = Knex({
    client: "sqlite3",
    connection: { filename: ":memory:" }
  });

  // migrate the schema
  const strategy = new DropCreateDatabaseAlways("sqlite3", knex);
  await migrate(schema.getSchemaText(), strategy);

  return new InMemoryDatabase(knex);
}
