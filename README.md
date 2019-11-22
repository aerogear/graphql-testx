# graphql-testx

<p align="center">
  <img width="128" src="https://user-images.githubusercontent.com/7964685/69164244-eeea1080-0aef-11ea-86f0-f34debab1682.png">
</p>

graphql-testx is a full-featured GraphQL server, based on Graphback and Apollo Server. With the minimum configuration required, you have a server ready for testing GraphQL client applications or libraries.
Unlike mocking alternatives, graphql-testx offers persistent data between queries and mutation using in-memory SQLite database.

![graphql-testx](https://user-images.githubusercontent.com/7964685/69070551-9dc31980-0a28-11ea-8b55-97707b26693c.png)

Read our [contributing guide](CONTRIBUTING.md) if you're looking to contribute.

## Getting Started

### Install graphql-testx

Using npm:

```
npm install graphql-testx@dev
```

or yarn:

```
yarn add graphql-testx@dev
```

### Create and Start the server

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

// close the server once you finish otherwise it
// will not allow nodejs to exit
server.close();
```

Under to hood we use Graphback to parse the Type Definitions/Data Model and generate the GraphQL schema and resolvers. See the [Graphback Docs on Data Model Definition](https://graphback.dev/docs/datamodel)

### Create the client

graphql-testx doesn't provide any graphql client, which means that you can use the `server.url()` graphql endpoint with your preferred client or your own developed client.

### Using graphql-testx with a test framework

We have a couple of [Examples](#examples) that shows how to integrate graphql-testx with different javascript test framework for testing graphql client libraries.

### Print generated GraphQL and DB schema

To see the generated schemas run:

```bash
npm run print-schema -- <FILE_WITH_GRAPHQL_SCHEMA>
```

### Initialize DB

It is possible to initialize DB with some data. For this use `setData` method of `TestxServer`. Method will replace data in DB with data provided. `setData` expects one argument - object where keys correspond to table names and values represent rows that should be inserted to table. Example:

```js
await server.setData({
  task: [
    { title: 'test1' },
    { title: 'test2' },
    { title: 'test3' }
  ]
});
```

## Features

- Major tests framework supported: **Mocha**, **Ava**, **Jasmine** and **Jest**

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
