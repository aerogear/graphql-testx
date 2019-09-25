import { IGraphQLBackend, OutputResolver, DatabaseSchemaManager, GraphQLBackendCreator  } from 'graphback';
import { existsSync, writeFileSync } from 'fs';
import * as folders from './config.json';

export async function generate(schemaText, config) {
  const backend: GraphQLBackendCreator  = new GraphQLBackendCreator(schemaText, config);
  const generated: IGraphQLBackend = await backend.createBackend("sqlite3");

  generated.resolvers.custom.forEach((output: OutputResolver) => {
    if (!existsSync(`${folders.resolvers}/generated/${output.name}.ts`) || output.name === 'index') {
      writeFileSync(`${folders.resolvers}/generated/${output.name}.ts`, output.output);
    }
  });

  writeFileSync(`${folders.schema}/schema.ts`, generated.schema);
  writeFileSync(`${folders.resolvers}/index.ts`, generated.resolvers.index);

  generated.resolvers.types.forEach((output: OutputResolver) =>
      writeFileSync(`${folders.resolvers}/generated/${output.name}.ts`, output.output)
  );
}

export async function db(schemaText, config) {
  const backend: GraphQLBackendCreator  = new GraphQLBackendCreator(schemaText, config);

  const connectionConfig = {
    filename: `${folders.database}/db.sqlite`
  };

  const manager = new DatabaseSchemaManager('sqlite3', connectionConfig);
  backend.registerDataResourcesManager(manager);

  await backend.createDatabase();
}