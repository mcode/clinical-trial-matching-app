# Install Scripts

This directory contains various scripts designed to automate the install process for various platforms.

Currently suppported platforms are Windows 10 Server and [Ubuntu Server](https://ubuntu.com/download/server) 22.04. Other Windows platforms with IIS _may_ work. Other Linux platforms would likely work as well, but the `install.sh` script only targets Ubuntu 22.04 at present.

Once installed, the software is set up within either IIS (on Windows) or nginx (on Linux) to run within a single server. On IIS, it uses iisnode to run the Node.js-based webapps within the IIS server. On nginx, it uses Passenger to run the Node.js-based webapps within the server. In both cases, the final URL layout for the server is the same:

| URL          | Description                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `/`          | Root user-based web app                                                                           |
| `/launch`    | The SMART on FHIR launch URL                                                                      |
| `/<wrapper>` | Each individual wrapper is placed under a directory with the name as specified in `wrappers.json` |

Wrapper configuration is contained within the `wrapper.json` file. This file contains a list of all wrappers and the branches that should be used, as well as additional configuration required in their `.env.local` file, for example, API keys. These API keys are not in the version checked in, instead, a file called `wrappers.local.json` should be created to supply values. Any value in the `wrappers.local.json` file takes precedent over the `wrappers.json` file.

A minimal `wrappers.json` file would be something like the following:

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

## Running the install under Windows

Copy the `install.ps1` and `wrappers.json` files into a directory on the Windows server. Copy or create a `wrappers.local.json` as described above to fill in the missing API keys.

The install script may need to be marked as being allowed to execute locally, via:

```powershell
Unblock-File install.ps1
```

The installer can then be run directly from PowerShell:

```powershell
.\install.ps1
```

After completing the install, a test script may be run to ensure everything is functioning as expected. (See below.)

## Running the install under Linux

Copy the `install.sh` and `wrappers.json` files into a directory on the Linux system. Copy or create a `wrappers.local.json` as described above to fill in the missing API keys.

The install script may need to be marked as being allowed to execute locally. This can be done via the following command:

```sh
chmod +x install.sh
```

The installer can then be run directly:

```sh
./install.sh
```

After completing the install, a test script may be run to ensure everything is functioning as expected. (See below.)

## Running the test script

A `test.js` file is also provided within this directory. It uses the `wrappers.json` file to check that the installed wrappers are functioning.

Copy it into the same directory as the above files (or into the final install directory) and run it via Node:

```sh
node test.js
```

The same command should work under both Windows and Linux. If everything works as expected, the test will show a green "OK" for each test and indicate a number of results returned by each wrapper. Errors returned will be reported, but the underlying errors will likely be located somewhere within the underlying server.

### Errors under Windows

Errors within the Windows environment will be located one of two places: the IIS log, or the `iisnode` directory within each individual wrapper.

### Errors under Linux

All error messages under Linux using nginx will be in the nginx error log, which under Ubuntu 22.04 will be located at `/var/log/nginx/error_log`.

## Windows Installer Options

These options control the Windows installer:

| Option                | Description                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `-InstallPath <dir>`  | The path where the CTMS software and all required files will be stored. Default: `C:\CTMS`                                                                                                                   |
| `-ExtraCAs <file>`    | A certificate authority .CER file to automatically trust. Used to automatically add a MITM CA should one be required for the install location. Also adds it to the wrappers. Default: empty, meaning ignored |
| `-NoInstall`          | Skip attempting to install prerequisite software (IIS, Node.js, Git, and the required IIS modules)                                                                                                           |
| `-NoGitPull`          | If given, do not attempt to pull latest code from GitHub                                                                                                                                                     |
| `-NoBuild`            | Skip the build step for the webapps                                                                                                                                                                          |
| `-NoConfigureWebapps` | Skip attempting to configure the various web apps                                                                                                                                                            |

## Linux Installer Options

These options control the Linux installer:

| Option                    | Description                                                                                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--install-dir <dir>`     | Directory where the CTMS software will be installed. Default: `/opt/ctms`                                                                                                                                                                           |
| `--username <user>`       | The name of the UNIX user account to install software under and run the webapps as. Default: `ctms`                                                                                                                                                 |
| `--group <user>`          | The name of the UNIX user account to install software under and run the webapps as. Default: `ctms`                                                                                                                                                 |
| `--extra-ca-certs <file>` | A certificate authority certificate to automatically trust. Used to automatically add a MITM CA should one be required for the install location. Also adds it to the wrappers. Default: `extra-cas.crt`, will be ignored if this file doesn't exist |
| `--no-extra-ca-certs`     | Explicitly do not add any extra CA certs                                                                                                                                                                                                            |
| `--no-network`            | Skip anything requiring a network connection                                                                                                                                                                                                        |
| `--no-git-pull`           | Skip attempting to pull latest code from GitHub                                                                                                                                                                                                     |
| `--no-build`              | Skip the build step for the webapps                                                                                                                                                                                                                 |
| `--no-webapp-configure`   | Skip attempting to configure the various web appsvarious web apps                                                                                                                                                                                   |

## Files in this direcotory

| Name            | Description                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `install.js`    | The cross-OS Node.js installer. Handles the install process for downloading and building the web apps within the Node.js environment.                             |
| `install.ps1`   | Windows PowerShell installer. Handles installing required software on Windows Server and then passing the remaining install to `install.js`.                      |
| `install.sh`    | UNIX bash script installer. Handles installing required software and building the basic directory structure before passing the remaining install to `install.js`. |
| `README.md`     | This file.                                                                                                                                                        |
| `test.js`       | Test script. Sends a test request to the main web app as well as                                                                                                  |
| `wrappers.json` | Configuration file for the individual wrappers. See below.                                                                                                        |

## wrappers.json Configuration

`wrappers.json` is a simple JSON file. The base value is an object, where each key gives the name a wrapper will be installed to. This name is also used to determine the GitHub URL of the wrapper, which currently must be `https://github.com/mcode/clinical-trial-matching-service-<name>.git`. (This will likely be updated to allow a specific URL to be used to override the default.)

The value for each key may either be `false` or `null` to skip that wrapper (when overriding from `wrappers.local.json`), or an object with the following keys:

| Key      | Description                                                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `branch` | String indicating the Git branch to use                                                                                                                                                                                                      |
| `env`    | A `Record<string, string>` containing environment variable names and their values. Setting this entirely overrides the values within the global wrapper, so setting it to an empty object means no keys are used in the final configuration. |
