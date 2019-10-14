export function sourceModule(input: string, modules: { [id: string]: any } = {}): any {
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
