import { DatabaseSchema, DatabaseImportData } from "./Database";
import { GraphbackClient } from "./GraphbackClient";

export interface StringDic {
  [name: string]: string;
}

export interface TestxApi {
  start(): Promise<void>;

  stop(): Promise<void>;

  close(): Promise<void>;

  cleanDatabase(): Promise<void>;

  httpUrl(): Promise<string>;

  wsUrl(): Promise<string>;

  getGraphQlSchema(): Promise<string>;

  getDatabaseSchema(): Promise<DatabaseSchema>;

  setData(data: DatabaseImportData): Promise<void>;

  bootstrap(): Promise<void>;

  getQueries(): StringDic;

  getMutations(): StringDic;

  getSubscriptions(): StringDic;

  getFragments(): StringDic;

  getClient(): GraphbackClient;
}

export function isTestxApiMethod(
  testx: TestxApi,
  name: string
): name is keyof TestxApi {
  return name in testx;
}
