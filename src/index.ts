import { GraphQLBackendCreator } from "graphback";
import { transpile } from "typescript";

export const config = {
  create: true,
  find: true,
  findAll: true,
  update: true,
  delete: false,
  subCreate: false,
  subUpdate: false,
  subDelete: false,
  disableGen: false,
};

function sourceModule(input: string, modules: { [id: string]: any } = {}): any {
  const m = new Function("exports", "require", "module", input);
  const fakeExports = { default: null };
  const fakeModule = { exports: fakeExports };
  const fakeRequire = (id: string) => {
    if (id in modules) {
      return modules[id];
    }
    return require(id);
  };
  m(fakeExports, fakeRequire, fakeModule);
  return fakeExports;
}

export class TestX {
  private model: string;

  constructor(model: string) {
    this.model = model;
  }

  public async start(): Promise<string> {
    // create the backend resolvers
    const creator = new GraphQLBackendCreator(this.model, config);
    const backend = await creator.createBackend("sqlite");

    // compile and source typeDefs
    const { typeDefs } = sourceModule(transpile(backend.schema));

    // compile and source resolvers
    const modules: { [id: string]: any } = {};
    for (const resolver of backend.resolvers.types) {
      modules[`./generated/${resolver.name}`] = sourceModule(
        transpile(resolver.output),
      );
    }
    const { resolvers } = sourceModule(
      transpile(backend.resolvers.index),
      modules,
    );

    console.log(typeDefs);
    console.log(resolvers);

    return "";
  }
}
