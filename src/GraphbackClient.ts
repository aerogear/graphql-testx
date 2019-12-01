import { GraphQLBackendCreator } from "graphback";
import { sourceModule } from "./utils";
import { transpile } from "typescript";
import { print } from "graphql/language/printer";
import { ASTNode } from "graphql";

interface ASTNodeDic {
  [key: string]: ASTNode;
}

interface UnknownDic {
  [key: string]: unknown;
}

interface StringDic {
  [key: string]: string;
}

export class GraphbackClient {
  private queries: StringDic;
  private mutations: StringDic;
  private fragments: StringDic;
  private subscriptions: StringDic;

  constructor(queries: StringDic, mutations: StringDic, fragments: StringDic, subscriptions: StringDic) {
    this.queries = queries;
    this.mutations = mutations;
    this.fragments = fragments;
    this.subscriptions = subscriptions;
  }

  public getQueries(): StringDic {
    return this.queries;
  }

  public getMutations(): StringDic {
    return this.mutations;
  }

  public getFragments(): StringDic {
    return this.fragments;
  }

  public getSubscriptions(): StringDic {
    return this.subscriptions;
  }
}

export async function initGraphbackClient(
  creator: GraphQLBackendCreator
): Promise<GraphbackClient> {
  const client = await creator.createClient();

  const modules: UnknownDic = {};
  const fragments: StringDic = {};
  const queries: StringDic = {};
  const mutations: StringDic = {};
  const subscriptions: StringDic = {};

  if (client.fragments !== undefined) {
    client.fragments.forEach(item => {
      const m = sourceModule(transpile(item.implementation));
      modules[`../fragments/${item.name}`] = m;
      fragments[item.name] = print((m as ASTNodeDic)[item.name]);
    });
  }

  if (client.queries !== undefined) {
    client.queries.forEach(item => {
      const m = sourceModule(transpile(item.implementation), modules);
      queries[item.name] = print((m as ASTNodeDic)[item.name]);
    });
  }

  if (client.mutations !== undefined) {
    client.mutations.forEach(item => {
      const m = sourceModule(transpile(item.implementation), modules);
      mutations[item.name] = print((m as ASTNodeDic)[item.name]);
    });
  }

  if (client.subscriptions !== undefined) {
    client.subscriptions.forEach(item => {
      const m = sourceModule(transpile(item.implementation), modules);
      subscriptions[item.name] = print((m as ASTNodeDic)[item.name]);
    });
  }

  return new GraphbackClient(queries, mutations, fragments, subscriptions);
}
