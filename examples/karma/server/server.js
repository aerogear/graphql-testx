const { TestxServer, TestxController } = require("../../../dist/src");

(async () => {
  const server = new TestxServer(`
    type Item {
      id: ID!
      title: String!
    }`);

  const controller = new TestxController(server);

  await controller.start();

  // send back the http url to the cli
  process.send(await controller.httpUrl());
})();
