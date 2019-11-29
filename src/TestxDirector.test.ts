import { serial as test } from "ava";
import { request } from "graphql-request";
import gql from "graphql-tag";
import { TestxDirector } from "./TestxDirector";
import { TestxController } from "./TestxController";
import { TestxServer } from "./TestxServer";

const ITEM_MODEL = `
  type Item {
    id: ID!
    title: String!
  }
`;

async function newTestx(
  schema: string
): Promise<[TestxController, TestxDirector]> {
  const server = new TestxServer(schema);
  const controller = new TestxController(server);
  await controller.start();
  const director = new TestxDirector(await controller.httpUrl());
  return [controller, director];
}

test("test start() and close() methods", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

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

  await controller.close();
});

test("stop() method should preserve stored items", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

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

  await controller.close();
});

test("cleanDatabase() method should remove all items", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

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

  await controller.close();
});

test("setData() should init DB with specified data and replace existing data", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

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

  await controller.close();
});

test("getGraphQLSchema() method should produce GQL schema with required definitions", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

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

  await controller.close();
});

test("getDatabaseSchema() method should return column names for all types to be stored at DB", async t => {
  const [controller, director] = await newTestx(ITEM_MODEL);

  const itemDbSchema = ["id", "title", "created_at", "updated_at"];

  await director.start();
  const dbSchema = await director.getDatabaseSchema();
  t.assert(dbSchema["item"]);
  t.deepEqual(dbSchema["item"], itemDbSchema);

  await controller.close();
});
