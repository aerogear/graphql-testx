import { ApolloServer } from "apollo-server";
import { generateTypeDefs, generateResolvers, generateDatabase } from "./graphback-core";

const defaultConfig = {
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
    private schema: string;
    private server: ApolloServer;

    constructor(schema: string) {
        this.schema = schema;
    }

    public async start() {
        await this.generateServer();
        await generateDatabase(this.schema, defaultConfig);

        let serverUrl = '';
        await this.server.listen().then(({ url }) => {
            serverUrl = url;
        })
        return serverUrl;
    }

    private async generateServer() {
        const typeDefs = await generateTypeDefs(this.schema, defaultConfig);
        const resolvers = await generateResolvers(this.schema, defaultConfig);

        this.server = new ApolloServer({ typeDefs, resolvers });
    }
}