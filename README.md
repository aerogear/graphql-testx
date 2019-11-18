# graphql-testx

<p align="center">
  <img width="256" src="./logo/graphql-testx.png">
</p>

graphql-testx is a full featured GraphQL server, with minimum configuration required, based on Graphback and Apollo Server, used for testing GraphQL client applications or libraries. It should not be confused with mocking alternatives because graphql-testx offers persistent data between queries and mutation using in-memory SQLite database.

## Getting Started

### Install graphql-testx

> Attention!: not yet released

Using npm:

```
npm install graphql-testx
```

or yarn:

```
yarn add graphql-testx
```

### Create and Start the server

The only thing you need to pass to `TestxServer` is the Data Model, because `TestxServer` is using Graphback under the hood, we are using the same [Data Model Definition](https://graphback.dev/docs/datamodel) as Graphback.

```js
// create the server using a data model
const server = new TestxServer(`
  type Item {
    id: ID!
    name: String
    title: String!
  }`);

// start the server
await server.start();

// retrieve the server url
console.log(`Running on ${server.url()}`);

// ...

// close the server otherwise the server
// will not allow nodejs to exit
server.close();
```

### Create the client

graphql-testx doesn't provide any graphql client, which means that you can use the `server.url()` graphql endpoint with your preferred client or your own developed client.

### Using a test framework

We have a couple of [Examples](#examples) that shows how integrate graphql-testx with different javascript test framework for testing graphql client libraries.

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

- Auto generated client queries, mutations and subscriptions (wip: [#15](https://github.com/aerogear/graphql-testx/issues/15))

- Rich API to control the server execution and database state
  [ `start()`, `stop()`, `close()`, `cleanDatabase()`, ... ]

## Examples

- Testing **Apollo Client** library with **mocha**

  [graphql-testx-apollo-client-example](./examples/apollo-client)

- Testing **Offix** library with **Jest**

  [graphql-testx-offix-example](./examples/offix)
