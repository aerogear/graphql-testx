import express from "express";
import { DatabaseSchemaManager, GraphQLBackendCreator } from "graphback";
import knex from "knex";
import { transpile } from "typescript";
import * as folders from "./config.json";

export async function generateTypeDefs(
  model: string,
  config: { [id: string]: any },
) {
  const creator = new GraphQLBackendCreator(model, config);
  const backend = await creator.createBackend("sqlite3");

  const { typeDefs } = sourceModule(transpile(backend.schema));
  return typeDefs;
}

export async function generateResolvers(
  model: string,
  config: { [id: string]: any },
) {
  const creator = new GraphQLBackendCreator(model, config);
  const backend = await creator.createBackend("sqlite3");
  const modules: { [id: string]: any } = {};

  for (const resolver of backend.resolvers.types) {
    modules[`./generated/${resolver.name}`] = sourceModule(
      transpile(resolver.output),
    );
  }

  const { resolvers } = sourceModule(
    transpile(backend.resolvers.index),
    modules,
  );

  return resolvers;
}

export async function generateDatabase(
  model: string,
  config: { [id: string]: any },
) {
  const backend: GraphQLBackendCreator = new GraphQLBackendCreator(
    model,
    config,
  );

  const connectionConfig = {
    filename: `${folders.database}/db.sqlite`,
  };

  const manager = new DatabaseSchemaManager("sqlite3", connectionConfig);
  backend.registerDataResourcesManager(manager);

  await backend.createDatabase();
}

export async function generateContext() {
  const client = knex({
    client: "sqlite3",
    connection: { filename: `${folders.database}/db.sqlite` },
    useNullAsDefault: true,
  });

  const context = async ({ req }: { req: express.Request }) => {
    return {
      req,
      db: client,
    };
  };

  return context;
}

function sourceModule(input: string, modules: { [id: string]: any } = {}): any {
  const m = new Function("exports", "require", "module", input);
  const fakeExports = { default: null };
  const fakeModule = { exports: fakeExports };
  
  const fakeRequire = (id: string) => {
    if (id in modules) {
      return modules[id];
    }
    return require(id);
  };

  m(fakeExports, fakeRequire, fakeModule);
  return fakeExports;
}
