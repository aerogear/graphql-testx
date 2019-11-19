import {
  DatabaseSchemaManager,
  GraphQLBackendCreator,
  IGraphQLBackend
} from "graphback";
import Knex from "knex";
import { transpile } from "typescript";
import { sourceModule } from "./utils";

export class BackendBuilder {
  private model: string;
  private config: { [id: string]: any };
  private backendCreator: GraphQLBackendCreator;
  private backend: IGraphQLBackend;

  constructor(model: string, config: { [id: string]: any }) {
    this.model = model;
    this.config = config;
  }

  public async generateBackend() {
    await this.init();
    const typeDefs = await this.generateTypeDefs();
    const resolvers = await this.generateResolvers();
    const dbConnection = await this.generateDatabase();
    return { typeDefs, resolvers, dbConnection };
  }

  private async init() {
    this.backendCreator = new GraphQLBackendCreator(this.model, this.config);
    this.backend = await this.backendCreator.createBackend("sqlite3");
  }

  private async generateTypeDefs() {
    const { typeDefs } = sourceModule(transpile(this.backend.schema));
    return typeDefs;
  }

  private async generateResolvers() {
    const modules: { [id: string]: any } = {};

    for (const resolver of this.backend.resolvers.types) {
      modules[`./generated/${resolver.name}`] = sourceModule(
        transpile(resolver.output)
      );
    }

    const { resolvers } = sourceModule(
      transpile(this.backend.resolvers.index),
      modules
    );

    return resolvers;
  }

  private async generateDatabase(): Promise<Knex> {
    const manager = new DatabaseSchemaManager("sqlite3", {
      filename: ":memory:"
    });
    this.backendCreator.registerDataResourcesManager(manager);
    await this.backendCreator.createDatabase();
    return manager.getConnection();
  }
}
