import test from "ava";
import { request } from "graphql-request";
import { TestxServer } from ".";

const ITEM_MODEL = `
  type Item {
    id: ID!
    title: String!
  }
`;

const FIND_ALL_ITEMS = `
  query findAllItems {
    findAllItems {
      id
      title
    }
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

test.serial("start TestxServer server", async t => {
  const server = new TestxServer(ITEM_MODEL);

  await server.start();
  t.assert(server.url());

  const result = await request(server.url(), server.getQueries().findAllItems);
  t.assert(result.findAllItems.length === 0);
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
  let result = await request(serverUrl, FIND_ALL_ITEMS);
  t.assert(result.findAllItems.length === 1, "Created item should be successfully fetched")

  server.stop()

  await t.throwsAsync(async() => { await request(serverUrl, FIND_ALL_ITEMS) }, null, "Should throw an error after stopping the server (ECONNREFUSED)")
  
  await server.start()
  result = await request(serverUrl, FIND_ALL_ITEMS);
  t.assert(result.findAllItems.length === 1, "The item should be still present after resuming the server")
})

test.serial("cleanDatabase() method should remove all items", async t => {
  const server = new TestxServer(ITEM_MODEL);
  
  await server.start();
  const serverUrl = server.url()

  await request(serverUrl, CREATE_ITEM);
  let result = await request(serverUrl, FIND_ALL_ITEMS);
  t.assert(result.findAllItems.length === 1, "Created item should be successfully fetched")

  await server.cleanDatabase()

  result = await request(serverUrl, FIND_ALL_ITEMS);
  t.assert(result.findAllItems.length === 0, "The item should be gone after calling cleanDatabase() method")
})
