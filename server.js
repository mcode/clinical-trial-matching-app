const nextjs = require('next');
const { default: getConfig } = require('next/config');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const port = parseInt(process.env.PORT, 10) || 3200;
const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const { serverRuntimeConfig } = getConfig();

    const server = express();

    server.use(
      session({
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        secret: serverRuntimeConfig.sessionSecretKey,
        store: new MemoryStore({
          checkPeriod: 24 * 60 * 60 * 1000, // Expire sessions after 24 hours
        }),
        resave: false,
        saveUninitialized: false,
      })
    );

    server.all('*', function nextMiddleware(req, res) {
      return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch(e => {
    console.error('Could not start server:');
    console.error(e);
    process.exit(1);
  });
