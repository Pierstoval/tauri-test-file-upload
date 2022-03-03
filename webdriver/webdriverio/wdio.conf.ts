import {spawn, spawnSync} from "child_process";
import * as path from "path";

// keep track of the `tauri-driver` child process
let tauriDriver;

const binSuffix = process.platform === 'win32' ? '.exe' : '';

const project_dir = path.resolve(__dirname+'/../../');

exports.config = {
  specs: [
    "./test/specs/**/*.ts",
  ],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      "tauri:options": {
        application: `${project_dir}/src-tauri/target/release/CHDesktop${binSuffix}`,
      },
    },
  ],
  reporters: ["spec"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  headless: true,

  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'trace',
  logLevels: {
    webdriver: 'trace',
    '@wdio/local-runner': 'trace',
    '@wdio/mocha-framework': 'trace',
    '@wdio/spec-reporter': 'trace'
  },

  // ensure the rust project is built since we expect this binary to exist for the webdriver sessions
  onPrepare: () => {
    const tauriPath = `${project_dir}/bin/tauri${binSuffix}`;
    spawnSync(tauriPath, ["build"]);
  },

  // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
  beforeSession: async function () {
    const tauriDriverPath = `${project_dir}/bin/tauri-driver${binSuffix}`;

    // Wait for the driver to be fully operational
    await Promise.all([
        new Promise(resolve => setTimeout(resolve, 1000)),
        Promise.resolve(tauriDriver = spawn(
            tauriDriverPath,
            [],
            {stdio: [null, process.stdout, process.stderr]}
        ))
    ]);

    return tauriDriver;
  },

  // clean up the `tauri-driver` process we spawned at the start of the session
  afterSession: () => tauriDriver.kill(),
};
