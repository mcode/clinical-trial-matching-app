const nextjs = require('next');
const { default: getConfig } = require('next/config');
const express = require('express');
const session = require('express-session');

const port = parseInt(process.env.PORT, 10) || 3200;
const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const { serverRuntimeConfig } = getConfig();

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
        db: 'sessions.db',
      });
    }
    server.use(session(sessionOptions));

    server.all('*', function nextMiddleware(req, res) {
      return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch(() => process.exit(1));
