import {
  DatabaseSchemaManager,
  GraphQLBackendCreator,
  IGraphQLBackend
} from "graphback";
import { print } from 'graphql/language/printer'
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

  public async generate() {
    await this.init();
    const typeDefs = await this.generateTypeDefs();
    const resolvers = await this.generateResolvers();
    const dbConnection = await this.generateDatabase();
    const {
      clientQueries,
      clientMutations,
    } = await this.generateClientQueriesAndMutations();
    return {
      typeDefs,
      resolvers,
      dbConnection,
      clientQueries,
      clientMutations,
    };
  }

  private async init() {
    this.backendCreator = new GraphQLBackendCreator(this.model, this.config);
    this.backend = await this.backendCreator.createBackend("sqlite3");
  }

  private generateTypeDefs() {
    const { typeDefs } = sourceModule(transpile(this.backend.schema));
    return typeDefs;
  }

  private generateResolvers() {
    const modules: { [id: string]: any } = {};

    this.backend.resolvers.types.forEach((item) => {
      modules[`./generated/${item.name}`] = sourceModule(
        transpile(item.output),
      );
    });

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

  private async generateClientQueriesAndMutations() {
    const {
      fragments,
      queries,
      mutations,
    } = await this.backendCreator.createClient();

    const modules: { [id: string]: any } = {};

    fragments.forEach((item) => {
      modules[`../fragments/${item.name}`] = sourceModule(
        transpile(item.implementation),
      );
    });

    const clientQueries = {};
    queries.forEach((item) => {
      clientQueries[item.name] = print(sourceModule(
        transpile(item.implementation),
        modules,
      )[item.name]);
    });

    const clientMutations = {};
    mutations.forEach((item) => {
      clientMutations[item.name] = print(sourceModule(
        transpile(item.implementation),
        modules,
      )[item.name]);
    });

    return { clientQueries, clientMutations };
  }
}