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

    server.use(
      session({
        secret: serverRuntimeConfig.sessionSecretKey,
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
  .catch(error => {
    console.error('Could not start server:');
    console.error(error);
    process.exit(1);
  });
