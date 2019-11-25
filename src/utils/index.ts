import portastic from "portastic";

export function sourceModule(input: string, modules: { [id: string]: unknown } = {}): unknown {
  const m = new Function("exports", "require", "module", input);
  const fakeExports = { default: null };
  const fakeModule = { exports: fakeExports };

  const fakeRequire = (id: string): unknown => {
    if (id in modules) {
      return modules[id];
    }
    return require(id);
  };

  m(fakeExports, fakeRequire, fakeModule);
  return fakeExports;
}

export async function getAvailablePort() {
  const ports = await portastic.find({ min: 29170, max: 29998 });

  if (ports.length < 1) {
    throw new Error("no free ports available in range 29170 - 29998");
  }

  return ports[0];
}
