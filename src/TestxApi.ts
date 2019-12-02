import { ImportData, DatabaseSchema } from "./generics";

export interface StringDic {
  [name: string]: string;
}

export interface TestxApi {
  start(): Promise<void>;

  stop(): Promise<void>;

  close(): Promise<void>;

  cleanDatabase(): Promise<void>;

  httpUrl(): Promise<string>;

  getGraphQlSchema(): Promise<string>;

  getDatabaseSchema(): Promise<DatabaseSchema>;

  setData(data: ImportData): Promise<void>;

  bootstrap(): Promise<void>;

  getQueries(): Promise<StringDic>;

  getMutations(): Promise<StringDic>;

  getSubscriptions(): Promise<StringDic>
}

class FakeApi implements TestxApi {
  public start(): Promise<void> {
    throw new Error("fake");
  }
  public stop(): Promise<void> {
    throw new Error("fake");
  }
  public close(): Promise<void> {
    throw new Error("fake");
  }
  public cleanDatabase(): Promise<void> {
    throw new Error("fake");
  }
  public httpUrl(): Promise<string> {
    throw new Error("fake");
  }
  public getGraphQlSchema(): Promise<string> {
    throw new Error("fake");
  }
  public getDatabaseSchema(): Promise<DatabaseSchema> {
    throw new Error("fake");
  }
  public setData(): Promise<void> {
    throw new Error("fake");
  }
  public bootstrap(): Promise<void> {
    throw new Error("fake");
  }
  public getQueries(): Promise<StringDic> {
    throw new Error("fake");
  }
  public getMutations(): Promise<StringDic> {
    throw new Error("fake");
  }
  public getSubscriptions(): Promise<StringDic> {
    throw new Error("fake");
  }
}

export function isTestxApiMethod(name: string): name is keyof TestxApi {
  return name in new FakeApi();
}
