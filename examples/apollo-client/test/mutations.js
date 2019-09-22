const gql = require("graphql-tag");
const ApolloServer = require("apollo-server").ApolloServer;
const ApolloClient = require("apollo-boost").default;
const fetch = require("node-fetch");
const expect = require("chai").expect;

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
    const items = [];
    let lastId = 0;

    const typeDefs = gql`
      type Item {
        id: ID!
        title: String!
      }

      input ItemInput {
        title: String!
      }

      input ItemFilter {
        id: ID
        title: String
      }

      type Query {
        findAllItems: [Item!]!
      }

      type Mutation {
        createItem(input: ItemInput!): Item!
        updateItem(id: ID!, input: ItemInput!): Item!
      }
    `;

    const resolvers = {
      Query: {
        findAllItems: () => {
          return items;
        }
      },

      Mutation: {
        createItem: (_, args) => {
          const item = {
            id: ++lastId,
            title: args.input.title
          };
          items.push(item);
          return item;
        },
        updateItem: (_, args) => {
          const item = items.find(item => item.id === parseInt(args.id, 10));
          item.title = args.input.title;
          return item;
        }
      }
    };

    const apollo = new ApolloServer({ typeDefs, resolvers });

    server = await apollo.listen();
  });

  after("close graphql server", () => {
    server.server.close();
  });

  before("initialize apollo client", () => {
    client = new ApolloClient({ uri: server.url, fetch: fetch });
  });

  it("should create a new item", async () => {
    const item = (await client.mutate({
      mutation: CREATE_ITEM,
      variables: { title: "TestA" }
    })).data.createItem;

    expect(item.id).to.not.be.null;
    expect(item.title).to.be.equal("TestA");
  });

  it("should update existing item", async () => {
    const testA = (await client.query({
      query: FIND_ALL_ITEMS
    })).data.findAllItems.find(item => item.title === "TestA");

    let testB = (await client.mutate({
      mutation: UPDATE_ITEM,
      variables: { id: testA.id, title: "TestB" }
    })).data.updateItem;

    expect(testB.id).to.be.equal(testA.id);
    expect(testB.title).to.be.equal("TestB");
  });
});
