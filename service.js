// Windows service information. Note that this won't work on other operating systems.
// Allows actions to be specified, in which case, they will be run in order.
// So, for example:
//
//    service.js install start
//
// Will install and then start the service.
//
// Note: requires node-windows. Install using:
//
//    npm install -g node-windows
//    npm link node-windows

const path = require('path');
const Service = require('node-windows').Service;

// Get the full path to the start script
const scriptPath = path.resolve(path.join(__dirname, 'server.js'));
const workingDirectory = path.resolve(__dirname);

const svc = new Service({
  name: 'Clinical Trial Matching App',
  description: 'Clinical Trial Matching App React Next.js server.',
  script: scriptPath,
  workingDirectory: workingDirectory,
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

// Supported actions
const AVAILABLE_ACTIONS = {
  install: () => { svc.install(); },
  start: () => { svc.start(); },
  stop: () => { svc.stop(); },
  uninstall: () => { svc.uninstall(); }
};

// Check for arguments, only ones accepted are the actions
const actions = [];

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg in AVAILABLE_ACTIONS) {
    actions.push(arg);
  } else if (arg === 'restart') {
    // Special:
    actions.push('stop');
    actions.push('start');
  } else {
    console.error('Unknown argument "' + arg + '".');
    process.exit(1);
  }
}

// Default to install
if (actions.length < 1) {
  actions.push('install');
}

const nextAction = () => {
  if (actions.length > 0) {
    const act = actions.shift();
    if (act in AVAILABLE_ACTIONS) {
      AVAILABLE_ACTIONS[act]();
    } else {
      console.error('Unknown action "' + act + '"');
      process.exit(2);
    }
  }
};

svc.on('install', () => {
  console.log('Service installed.');
  nextAction();
});
svc.on('alreadyinstalled', () => {
  console.log('Service already installed.');
  nextAction();
});
svc.on('uninstall', () => {
  console.log('Service uninstalled.');
  nextAction();
});
svc.on('alreadyuninstalled', () => {
  console.log('Service was already uninstalled (did not exist).');
  nextAction();
});
svc.on('start', () => {
  console.log('Service started.');
  nextAction();
});
svc.on('stop', () => {
  console.log('Service stopped.');
  nextAction();
});
svc.on('error', () => {
  console.log('An error occurred - aborting any future actions.');
});

// And start the action list
nextAction();
