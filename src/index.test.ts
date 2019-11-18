import test from "ava";
import { request } from "graphql-request";
import { TestxServer } from ".";

test("start TestxServer server", async t => {
  const FIND_ALL_ITEMS = `
    query findAllItems {
      findAllItems {
        id
        title
      }
    }
  `;

  const server = new TestxServer(`
    type Item {
      id: ID!
      title: String!
    }
  `);

  await server.start();
  t.assert(server.url());

  const result = await request(server.url(), FIND_ALL_ITEMS);
  t.assert(result.findAllItems.length === 0);
});
