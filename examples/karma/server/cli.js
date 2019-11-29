#!/usr/bin/env node

const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

const pidFile = path.join(__dirname, "server.pid");

async function start() {
  if (fs.existsSync(pidFile)) {
    console.error("kill the running testx controller");
    await stop();
  }

  const child = child_process.fork(path.join(__dirname, "server.js"), [], {
    detached: true,
    silent: true
  });

  fs.writeFileSync(pidFile, child.pid);

  child.once("message", httpUrl => {
    console.error(`TestX Controller started at ${httpUrl}`);
    console.log(httpUrl)
    process.exit(0);
  });
}

async function stop() {
  if (!fs.existsSync(pidFile)) {
    console.error("error: no server running");
    return;
  }

  const pid = fs.readFileSync(pidFile);
  try {
    process.kill(pid);
  } catch (e) {
    console.error(e);
  } finally {
    fs.unlinkSync(pidFile);
  }
}

switch (process.argv[2]) {
  case "start":
    start();
    break;
  case "stop":
    stop();
    break;
  default:
    console.error(`error: ${process.argv[2]} is not a valid argument`);
}
