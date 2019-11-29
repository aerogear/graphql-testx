exports.default = function(config) {
  if (config.testxUrl === undefined) {
    throw new Error(
      `please start the testx controller before running the tests`
    );
  }

  config.set({
    client: {
      args: [config.testxUrl]
    },
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: ["test/**/*.test.js"],
    preprocessors: {"test/**/*.test.js": ["webpack"]},
    webpack: {
      mode: "development"
    },
    reporters: ["mocha"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    concurrency: Infinity
  });
};
