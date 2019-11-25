import { SchemaProvider } from "graphback";

export class GraphbackSchema implements SchemaProvider {
  private schema: string;

  constructor(schema: string) {
    this.schema = schema;
  }

  public getSchemaText(): string {
    return this.schema;
  }
}
