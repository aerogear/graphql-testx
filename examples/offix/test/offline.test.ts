import "cross-fetch/polyfill";
import "fake-indexeddb/auto";

import gql from "graphql-tag";
import {
  ApolloOfflineClient,
  createClient,
  NetworkStatus,
  NetworkStatusChangeCallback
} from "offix-client";
import { TestxServer } from "../../../src";

class ToggleableNetworkStatus implements NetworkStatus {
  private online = true;
  private callbacks: NetworkStatusChangeCallback[] = [];

  public onStatusChangeListener(callback: NetworkStatusChangeCallback): void {
    this.callbacks.push(callback);
  }

  public async isOffline(): Promise<boolean> {
    return !this.online;
  }

  public setOnline(online: boolean): void {
    this.online = online;
    for (const callback of this.callbacks) {
      callback.onStatusChange({ online });
    }
  }
}

async function newClient(
  url: string
): Promise<[ApolloOfflineClient, ToggleableNetworkStatus]> {
  const network = new ToggleableNetworkStatus();

  const client = await createClient({ networkStatus: network, httpUrl: url });

  return [client, network];
}

// TODO: remove this queries once we expose client queries/mutations
// TODO: from the TestxServer API
// TODO: https://github.com/aerogear/graphql-testx/issues/15
export const FIND_ALL_TASKS = gql`
  query findAllTasks {
    findAllTasks {
      id
      version
      title
      description
      author
    }
  }
`;

export const ADD_TASK = gql`
  mutation createTask(
    $version: Int!
    $description: String!
    $title: String!
    $author: String!
  ) {
    createTask(
      input: {
        version: $version
        title: $title
        description: $description
        author: $author
      }
    ) {
      id
      version
      title
      description
      author
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask(
    $id: ID!
    $version: Int!
    $title: String!
    $description: String!
    $author: String!
  ) {
    updateTask(
      id: $id
      input: {
        version: $version
        title: $title
        description: $description
        author: $author
      }
    ) {
      id
      version
      title
      description
      author
    }
  }
`;

let server: TestxServer;

beforeAll(async () => {
  server = new TestxServer(`
  type Task {
    id: ID!
    version: Int!
    title: String!
    description: String!
    author: String!
  }`);
  await server.start();
  console.log(`Running on ${server.url()}`);
}, 10 * 1000);

afterAll(() => {
  server.close();
});

it("update an object while offline and assert that the object get updated on the server when returning online", async () => {
  expect.assertions(10);

  // setup client and network status in each tests
  const [client, network] = await newClient(server.url());

  network.setOnline(true);

  // create the task while online
  const createTaskResult = await client.offlineMutation({
    mutation: ADD_TASK,
    variables: {
      version: 1,
      title: "bo",
      description: "some random words",
      author: "myself"
    }
  });
  const newTask = createTaskResult.data.createTask;

  expect(newTask.id).toBeDefined();
  expect(newTask.title).toEqual("bo");
  expect(newTask.description).toEqual("some random words");

  // go offline
  network.setOnline(false);

  // update the task while offline
  try {
    await client.offlineMutation({
      mutation: UPDATE_TASK,
      variables: {
        ...newTask,
        title: "something new",
        description: "updated desc"
      }
    });
  } catch (e) {
    expect(e.networkError).toBeDefined();
    expect(e.networkError.offline).toBeTruthy();
  }

  // go back online
  network.setOnline(true);

  // give it some times to process the offline mutation
  await new Promise(r => setTimeout(r, 300));

  // query all tasks ignoring the cache
  const findAllTasksResult = await client.query({
    query: FIND_ALL_TASKS,
    fetchPolicy: "network-only"
  });

  const tasks = findAllTasksResult.data.findAllTasks;
  expect(tasks).toHaveLength(1);

  const updatedTask = tasks[0];
  expect(updatedTask.id).toEqual(newTask.id);
  expect(updatedTask.title).toEqual("something new");
  expect(updatedTask.description).toEqual("updated desc");
  expect(updatedTask.author).toEqual("myself");
});
