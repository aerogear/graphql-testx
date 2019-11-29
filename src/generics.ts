export interface ImportData {
  [table: string]: {
    [column: string]: unknown;
  }[];
}

export interface DatabaseSchema {
  [table: string]: string[];
}
