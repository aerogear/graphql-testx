import { serial as test } from "ava";
import { request } from "graphql-request";
import gql from "graphql-tag";
import { TestxServer } from "./TestxServer";
import { TestxDirector } from "./TestxDirector";

const ITEM_MODEL = `
  type Item {
    id: ID!
    title: String!
  }
`;

function initServer(): [TestxServer, TestxDirector] {
  const server = new TestxServer(ITEM_MODEL);
  server.startCardinal(4004);
  const director = new TestxDirector(`http://localhost:4004`);
  return [server, director];
}

test("test start() and close() methods", async t => {
  const [server, director] = initServer();

  await director.start();
  const httpUrl = await director.httpUrl();
  t.assert(httpUrl);

  const queries = await director.getQueries();
  const result = await request(httpUrl, queries.findAllItems);
  t.assert(result.findAllItems.length === 0);

  await director.close();
  await t.throwsAsync(
    async () => {
      await request(httpUrl, queries.findAllItems);
    },
    null,
    "Should throw an error after closing the server (ECONNREFUSED)"
  );

  await server.closeCardinal();
});

test.skip("start multiple TestxServer servers at the same time", async t => {
  // Issue: https://github.com/aerogear/graphql-testx/issues/47
  const [server1] = initServer();
  const [server2] = initServer();

  // start both servers at the same time
  await Promise.all([server1.start(), server2.start()]);

  t.assert(true);
});

test("stop() method should preserve stored items", async t => {
  const [server, director] = initServer();

  await director.start();
  const httpUrl = await director.httpUrl();
  const queries = await director.getQueries();
  const mutations = await director.getMutations();

  await request(httpUrl, mutations.createItem, { title: "test" });
  let result = await request(httpUrl, queries.findAllItems);
  t.assert(
    result.findAllItems.length === 1,
    "Created item should be successfully fetched"
  );

  await director.stop();

  await t.throwsAsync(
    async () => {
      await request(httpUrl, queries.findAllItems);
    },
    null,
    "Should throw an error after stopping the server (ECONNREFUSED)"
  );

  await director.start();
  result = await request(httpUrl, queries.findAllItems);
  t.assert(
    result.findAllItems.length === 1,
    "The item should be still present after resuming the server"
  );

  await server.closeCardinal();
});

test("cleanDatabase() method should remove all items", async t => {
  const [server, director] = initServer();

  await director.start();
  const httpUrl = await director.httpUrl();
  const queries = await director.getQueries();
  const mutations = await director.getMutations();

  await request(httpUrl, mutations.createItem, { title: "test" });
  let result = await request(httpUrl, queries.findAllItems);
  t.assert(
    result.findAllItems.length === 1,
    "Created item should be successfully fetched"
  );

  await director.cleanDatabase();

  result = await request(httpUrl, queries.findAllItems);
  t.assert(
    result.findAllItems.length === 0,
    "The item should be gone after calling cleanDatabase() method"
  );

  await server.closeCardinal();
});

test("setData() should init DB with specified data and replace existing data", async t => {
  const [server, director] = initServer();

  await director.start();
  const httpUrl = await director.httpUrl();
  const queries = await director.getQueries();
  const mutations = await director.getMutations();

  await request(httpUrl, mutations.createItem, { title: "test" });
  let result = await request(httpUrl, queries.findAllItems);
  t.assert(
    result.findAllItems.length === 1,
    "Created item should be successfully fetched"
  );

  const dataToSet = [
    { id: "0", title: "foo" },
    { id: "1", title: "bar" }
  ];
  await director.setData({
    item: dataToSet
  });
  result = await request(httpUrl, queries.findAllItems);
  t.deepEqual(
    result.findAllItems,
    dataToSet,
    "Only items created with setData() method should be fetched"
  );

  await server.closeCardinal();
});

test("getGraphQLSchema() method should produce GQL schema with required definitions", async t => {
  const [server, director] = initServer();
  const defsToBeGenerated = [
    "Item",
    "ItemInput",
    "ItemFilter",
    "Query",
    "Mutation"
  ];

  await director.start();
  const schema = await director.getGraphQlSchema();
  t.assert(typeof schema === "string");

  const parsedSchema = gql`
    ${schema}
  `;
  const definitions = parsedSchema.definitions.map(d => d.name.value);
  t.deepEqual(definitions, defsToBeGenerated);

  await server.closeCardinal();
});

test("getDatabaseSchema() method should return column names for all types to be stored at DB", async t => {
  const [server, director] = initServer();
  const itemDbSchema = ["id", "title", "created_at", "updated_at"];

  await director.start();
  const dbSchema = await director.getDatabaseSchema();
  t.assert(dbSchema["item"]);
  t.deepEqual(dbSchema["item"], itemDbSchema);

  server.closeCardinal();
});
