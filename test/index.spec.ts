import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import fetch from "node-fetch";
import { TestX } from "../src";

describe("TestX", () => {
  it("should start the server", async () => {
    const testx = new TestX(`
      type Item {
        id: ID!
        title: String!
      }
    `);

    const url = await testx.start();

    const client = new ApolloClient({ uri: url, fetch });

    await client.query({
      query: gql`
        query findAllItems {
          findAllItems {
            id
            title
          }
        }
      `
    });
  });
});
