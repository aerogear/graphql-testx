import process from "process";
import { readFileSync } from "fs";
import { printSchema, introspectionQuery, buildClientSchema } from "graphql";
import axios from "axios";

import { TestxServer } from "../";

(async () => {
  const schemaFile = process.argv[2];
  const schema = readFileSync(schemaFile, 'utf8');

  const server = new TestxServer(schema);
  await server.start();

  const response = await axios.post(server.url(), { query: introspectionQuery });
  console.log(printSchema(buildClientSchema(response.data.data)));

  server.close();
})();