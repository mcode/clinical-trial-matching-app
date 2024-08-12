const nextjs = require('next');
const { default: getConfig } = require('next/config');
const express = require('express');
const session = require('express-session');

function getPort() {
  const port = process.env.PORT;
  if (port) {
    if (/^\d+/.test(port)) {
      return parseInt(port, 10);
    } else {
      return port;
    }
  }
  return 3200;
}

const port = getPort();
const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
    console.log('Starting server with the following options:');
    for (const k of Object.keys(publicRuntimeConfig).sort()) {
      console.log('  %s = %j', k, publicRuntimeConfig[k]);
    }

    const server = express();

    const sessionOptions = {
      secret: serverRuntimeConfig.sessionSecretKey,
      resave: false,
      saveUninitialized: false,
    };

    if (!dev) {
      console.log('Running in production mode, using connect-sqlite3 for session store');
      const SQLiteStore = require('connect-sqlite3')(session);
      sessionOptions.store = new SQLiteStore({
        db: process.env.SESSION_FILE ?? 'sessions.db',
        dir: process.env.SESSION_DIR ?? '.',
      });
      if (!serverRuntimeConfig.sessionSecretKey) {
        console.error(
          'Warning: SESSION_SECRET_KEY was not set. Please set this value in either .env.local or .env.production.local'
        );
      }
    }
    server.use(session(sessionOptions));

    server.all('*', function nextMiddleware(req, res) {
      return handle(req, res);
    });

    console.log('Starting server...');
    const httpServer = server.listen(port, process.env.HOSTNAME, () => {
      try {
        console.log('Server ready.');
        const address = httpServer.address();
        console.log(
          `> Ready on ${typeof address === 'object' ? `http://${address.address}:${address.port}` : address}`
        );
      } catch (ex) {
        console.error('Error finding server address:');
        console.error(ex);
        console.error('Server may or may not be running successfully.');
      }
    });

    httpServer.on('error', err => {
      console.error('An error occurred:');
      console.error(err);
    });
  })
  .catch(e => {
    console.error('Server failed to start.');
    console.error(e);
    process.exitCode = 1;
  });
