import test from "ava";
import { request } from "graphql-request";
import { TestxServer } from ".";

const ITEM_MODEL = `
  type Item {
    id: ID!
    title: String!
  }
`;

test("start TestxServer server", async t => {
  const FIND_ALL_ITEMS = `
    query findAllItems {
      findAllItems {
        id
        title
      }
    }
  `;

  const server = new TestxServer(ITEM_MODEL);

  await server.start();
  t.assert(server.url());

  const result = await request(server.url(), FIND_ALL_ITEMS);
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
