import { ApolloServer } from "apollo-server";
import { Server } from "http";
import {
  generateContext,
  generateDatabase,
  generateResolvers,
  generateTypeDefs,
} from "./utils/index";

const defaultConfig = {
  create: true,
  update: true,
  findAll: true,
  find: true,
  delete: true,
  subCreate: false,
  subUpdate: false,
  subDelete: false,
  disableGen: false,
};

export class TestxServer {
  private schema: string;
  private server: Server;
  private serverUrl: string;

  constructor(schema: string) {
    this.schema = schema;
  }

  public async start() {
    const apolloServer = await this.generateServer();
    await generateDatabase(this.schema, defaultConfig);

    const { server, url } = await apolloServer.listen();
    this.server = server;
    this.serverUrl = url;
  }

  public close() {
    this.server.close();
  }

  public url() {
    return this.serverUrl;
  }

  private async generateServer() {
    const typeDefs = await generateTypeDefs(this.schema, defaultConfig);
    const resolvers = await generateResolvers(this.schema, defaultConfig);
    const context = await generateContext();
    const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
    return apolloServer;
  }
}
