import ApolloClient from "apollo-boost";
import { expect } from "chai";
import gql from "graphql-tag";
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { resolve } from "path";
import { TestxServer } from "../../../src";

describe("test mutations", () => {
  let server;
  let client;

  const CREATE_ITEM = gql`
    mutation createItem($title: String!) {
      createItem(input: { title: $title }) {
        id
        title
      }
    }
  `;

  before("start graphql server", async () => {
    const schema = readFileSync(resolve(__dirname, '../fixtures/schema.graphql'), 'utf8');
    server = new TestxServer(schema);
    await server.start();
    console.log(`Running on ${server.url()}`);
  });

  after("close graphql server", () => {
    server.close();
    console.log(`Connection with server closed`);
  });

  before("initialize apollo client", () => {
    client = new ApolloClient({ uri: server.url(), fetch });
  });

  it("should create a new item", async () => {
    const result = await client.mutate({
      mutation: CREATE_ITEM,
      variables: { title: "TestA" }
    });
    const item = result.data.createItem;

    expect(item.id).to.not.be.null;
    expect(item.title).to.be.equal("TestA");
  });

  it("should update existing item", async () => {
    const findResult = await client.query({
      query: gql`${server.getQueries().findAllItems}`
    });
    const itemV1 = findResult.data.findAllItems.find(i => i.title === "TestA");
    expect(itemV1).to.be.exist;

    const updateResult = await client.mutate({
      mutation: gql`${server.getMutations().updateItem}`,
      variables: { id: itemV1.id, title: "TestB" }
    });
    const itemV2 = updateResult.data.updateItem;

    expect(itemV2.id).to.be.equal(itemV1.id);
    expect(itemV2.title).to.be.equal("TestB");
  });
});
