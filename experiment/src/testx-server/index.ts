import { ApolloServer } from "apollo-server";
import { generate, db } from "./graphback-core";

const defautConfig = {
    "create": true,
    "update": true,
    "findAll": true,
    "find": true,
    "delete": true,
    "subCreate": true,
    "subUpdate": true,
    "subDelete": true,
    "disableGen": false
  }

export class TestxServer {
    schema: string;
    apolloServer: ApolloServer;

    constructor(schema: string) {
        this.schema = schema;
        this.generateServerStructure();
        this.generateDatabase();
    }

    private async generateServerStructure() {
        const schemaText = this.schema;
        generate(schemaText, defautConfig);
    }

    private async generateDatabase() {
        const schemaText = this.schema;
        db(schemaText, defautConfig);
    }
}