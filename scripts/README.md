# Install Scripts

This directory contains various scripts designed to automate the install process for various platforms.

Currently suppported platforms are Windows 10 Server and [Ubuntu Server](https://ubuntu.com/download/server) 22.04.

It should be possible to take a freshly installed Ubuntu server, copy the `install.sh`, `install.js`, and `wrappers.json` files on the server, and then run `install.sh` to start the entire installation process.

You may create a `wrappers.local.json` file to fill in the missing API keys. It would look something like:

```json
{
  "ancora.ai": {
    "env": {
      "ANCORA_AI_API_KEY": "<Ancora.ai API key>"
    }
  },
  "carebox": {
    "env": {
      "MATCHING_SERVICE_AUTH_CLIENT_ID": "<Carebox client ID>",
      "MATCHING_SERVICE_AUTH_CLIENT_SECRET": "<Carebox client secret>"
    }
  }
}
```

Under Windows, the `install.ps1` script runs through installing all necessary software. **Note:** At present, this doesn't use the configuration within the `wrappers.json` file. It is intended that eventually the `install.ps1` script will invoke the `install.js` script to complete the install process, but right now, it is the original script and therefore still needs to be updated to invoke the `install.js` script which does use a local configuration file.
