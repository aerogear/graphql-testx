import test from "ava";
import { request } from "graphql-request";
import { TestxServer } from ".";

const ITEM_MODEL = `
  type Item {
    id: ID!
    title: String!
  }
`;

const CREATE_ITEM = `
  mutation {
    createItem( input: { title: "test" } ) {
      id
      title
    }
  }
`;

test.serial("test start() and close() methods", async t => {
  const server = new TestxServer(ITEM_MODEL);

  await server.start();
  t.assert(server.url());

  const result = await request(server.url(), server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 0);

  server.close()
  await t.throwsAsync(async() => { await request(server.url(), server.getQueries().findAllItems) }, null, "Should throw an error after closing the server (ECONNREFUSED)")

});

test.skip("start multiple TestxServer servers at the same time", async t => {
  // Issue: https://github.com/aerogear/graphql-testx/issues/47
  const server1 = new TestxServer(ITEM_MODEL);
  const server2 = new TestxServer(ITEM_MODEL);

  // start both servers at the same time
  await Promise.all([server1.start(), server2.start()]);

  t.assert(true);
});

test.serial("stop() method should preserve stored items", async t => {

  const server = new TestxServer(ITEM_MODEL);
  
  await server.start();
  const serverUrl = server.url()

  await request(serverUrl, CREATE_ITEM);
  let result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 1, "Created item should be successfully fetched")

  server.stop()

  await t.throwsAsync(async() => { await request(serverUrl, server.getQueries().findAllItems) }, null, "Should throw an error after stopping the server (ECONNREFUSED)")
  
  await server.start()
  result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 1, "The item should be still present after resuming the server")
})

test.serial("cleanDatabase() method should remove all items", async t => {
  const server = new TestxServer(ITEM_MODEL);
  
  await server.start();
  const serverUrl = server.url()

  await request(serverUrl, CREATE_ITEM);
  let result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 1, "Created item should be successfully fetched")

  await server.cleanDatabase()

  result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 0, "The item should be gone after calling cleanDatabase() method")
})

test.serial("setData() should init DB with specified data and replace existing data", async t => {
  const server = new TestxServer(ITEM_MODEL);
  
  await server.start();
  const serverUrl = server.url()

  await request(serverUrl, CREATE_ITEM);
  let result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 1, "Created item should be successfully fetched")

  await server.setData({
    item: [ {id: 0, title: "foo"}, {id: 1, title: "bar"} ]
  })
  result = await request(serverUrl, server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 2, "Only items created with setData() method should be fetched")
  t.assert(result.findAllItems.filter(i => i.title.match(/foo|bar/g).length === 2))
})

test.serial("getGraphQLSchema() method should produce GQL schema", async t => {
  const server = new TestxServer(ITEM_MODEL);
  
  await server.start()
  const schema = server.getGraphQlSchema()
  t.assert(typeof schema === 'string')
})

test.serial("getDatabaseSchema() method should return column names for all types to be stored at DB", async t => {
  const server = new TestxServer(ITEM_MODEL);
  const itemDbSchema = ['id', 'title', 'created_at', 'updated_at']
  
  await server.start();
  const dbSchema = await server.getDatabaseSchema()
  t.assert(dbSchema['item'])
  t.assert(dbSchema['item'].length === itemDbSchema.length)
  t.assert(dbSchema['item'].every(c => itemDbSchema.includes(c)))
})