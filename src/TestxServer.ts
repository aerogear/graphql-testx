import { Express } from "express-serve-static-core";
import { GraphbackDataProvider } from "graphback";
import { ExpressServer } from "./ExpressServer";
import { GraphbackSchema } from "./GraphbackSchema";
import { InMemoryDatabase } from "./InMemoryDatabase";

export class TestxServer {
  private schema: GraphbackSchema;
  private server: ExpressServer;
  private database: InMemoryDatabase;

  constructor(schema: string) {
    this.schema = new GraphbackSchema(schema);
  }

  public async start() {
    await this.bootstrapDatabase();
    await this.bootstrapServer(this.database.getProvider());
    await this.server.start();
  }

  public async close() {
    await this.server.stop();
    await this.database.destroy();
  }

  public url() {
    return this.server.getHttpUrl();
  }

  /**
   * Generate the sqlite3 in-memory-db from the graphback schema
   */
  private async bootstrapDatabase() {
    if (this.database) {
      return;
    }

    const database = new InMemoryDatabase();
    await database.init(this.schema);
    this.database = database;
  }

  /**
   * Generate the Apollo Server and Express server from the graphback schema
   */
  private async bootstrapServer(
    provider: GraphbackDataProvider
  ): Promise<Express> {
    if (this.server) {
      return;
    }

    const server = new ExpressServer();
    await server.init(this.schema, provider);
    this.server = server;
  }
}
