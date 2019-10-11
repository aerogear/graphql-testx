import ApolloClient from "apollo-boost";
import { expect } from "chai";
import gql from "graphql-tag";
import fetch from "node-fetch";
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

  const UPDATE_ITEM = gql`
    mutation updateItem($id: ID!, $title: String!) {
      updateItem(id: $id, input: { title: $title }) {
        id
        title
      }
    }
  `;

  const FIND_ALL_ITEMS = gql`
    query findAllItems {
      findAllItems {
        id
        title
      }
    }
  `;

  before("start graphql server", async () => {
    server = new TestxServer(`
      type Item {
        id: ID!
        name: String
        title: String!
      }`,
    );
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
    const item = (await client.mutate({
      mutation: CREATE_ITEM,
      variables: { title: "TestA" },
    })).data.createItem;

    expect(item.id).to.not.be.null;
    expect(item.title).to.be.equal("TestA");
  });

  it("should update existing item", async () => {
    const testA = (await client.query({
      query: FIND_ALL_ITEMS,
    })).data.findAllItems.find((item) => item.title === "TestA");

    const testB = (await client.mutate({
      mutation: UPDATE_ITEM,
      variables: { id: testA.id, title: "TestB" },
    })).data.updateItem;

    expect(testB.id).to.be.equal(testA.id);
    expect(testB.title).to.be.equal("TestB");
  });
});
