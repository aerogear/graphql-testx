import axios from "axios";
import { readFileSync } from "fs";
import { buildClientSchema, introspectionQuery, printSchema } from "graphql";
import process from "process";

import { TestxServer } from "../";

(async () => {
  const schemaFile = process.argv[2];
  const schema = readFileSync(schemaFile, 'utf8');

  const server = new TestxServer(schema);
  await server.start();

  const response = await axios.post(server.url(), { query: introspectionQuery });

  // tslint:disable-next-line:no-console
  console.log('GraphQL Schema\n', printSchema(buildClientSchema(response.data.data)));

  // tslint:disable-next-line:no-console
  console.log('DB Schema\n', await server.getDbSchema());

  server.close();
})();