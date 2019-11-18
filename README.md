# graphql-testx

<p align="center">
  <img width="256" src="./logo/graphql-testx.png">
</p>

graphql-testx is a full featured GraphQL server, with minimum configuration required,
based on Graphback and Apollo Server, used for testing GraphQL client applications or
libraries. It should not be confused with mocking alternatives because graphql-testx
offers persistent data between queries and mutation using in-memory SQLite database.

## Features

- Major tests framework supported: **mocha**, **Jasmine** and **Jest**

- Minimum configuration required to generate out-of-the-box queries, mutations
  and subscriptions (subscriptions are in wip: [#13](https://github.com/aerogear/graphql-testx/issues/13)):

  ```js
  server = new TestxServer(`
    type Task {
      id: ID!
      version: Int!
      title: String!
      description: String!
      author: String!
    }`);

  // TODO: Add generated schema example: https://github.com/aerogear/graphql-testx/issues/36
  ```

- Persistent storage and real data between queries, mutations and subscriptions:

  ```js
  // see the example ./examples/apollo-client/test/mutations.spec.ts for the full code

  await client.mutate({
    mutation: CREATE_ITEM,
    variables: { title: "TestA" }
  });

  const result = await client.query({
    query: FIND_ALL_ITEMS,
    fetchPolicy: "network-only"
  });

  expect(result.data.findAllItems[0].title).to.be.equal("TestA");
  ```

- Auto generated client queries, mutations and subscriptions (wip: [15](https://github.com/aerogear/graphql-testx/issues/15))

- Rich API to control the server execution and database state
  [ `start()`, `stop()`, `close()`, `cleanDatabase()`, ... ]

## Examples

- [graphql-testx-apollo-client-example](./examples/apollo-client)
- [graphql-testx-offix-example](./examples/offix)
