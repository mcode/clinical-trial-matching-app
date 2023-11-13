#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const child_process = require('child_process');
const crypto = require('crypto');
const util = require('util');

// This is the main install script for everything.

/**
 * Default installation path
 */
const INSTALL_PATH = '/opt/ctms';
/**
 * Default extra CA file.
 */
const EXTRA_CAS = 'ca.pem';

// Installer code below

/**
 * Simple function to execute a command line program. By default returns
 * just the exit code.
 * @param {string} command the program to run
 * @param {string[]} args arguments to pass to the program
 * @param {object} options options to pass to child_process.spawn, with
 * a couple of "special" options:
 *   - `capture`: `true` to capture stdout and return that instead of
 *      the exit code
 *   - `pipeToChild`: if set, write its contents to the stdin in the child
 *   - `throwOnError`: defaults to `true`, throw if the exit code isn't 0
 */
function exec(command, args, options) {
  // Auto-promote to string array
  if (typeof args === 'string') {
    args = [args];
  }
  return new Promise((resolve, reject) => {
    try {
      const childStdout = options.capture ? [] : null;
      const child = child_process.spawn(command, args, options);
      let rejected = false;
      child.stdout.on('data', data => {
        process.stdout.write(data);
      });
      child.stderr.on('data', data => {
        process.stderr.write(data);
      });
      child.on('close', exitCode => {
        // If rejected, ignore this, promise was rejected
        if (!rejected) {
          if (exitCode != 0 && (options.throwOnError ?? true)) {
            reject(new Error(`Error response from ${command}: exit ${exitCode}`));
          } else if (childStdout != null) {
            resolve(childStdout);
          } else {
            resolve(exitCode);
          }
        }
      });
      child.on('error', error => {
        rejected = true;
        reject(error);
      });
      if (options.pipeToChild) {
        child.stdin.write(options.pipeToChild, error => {
          if (error) {
            if (!rejected) {
              rejected = true;
              reject(rejected);
            }
          } else {
            // Tell the child process we sent everything
            child.stdin.end();
          }
        });
      }
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * Helper function to run PowerShell script for various parts that need to use
 * PowerShell commandlets to configure IIS.
 * @param {string} powerShellScript
 */
function runPowerShell(powerShellScript) {
  return exec('powershell', ['-Command', '-'], { pipeToChild: powerShellScript });
}

async function exists(path, type) {
  try {
    const stat = await fs.stat(path);
    if (type) {
      switch (type) {
        case 'file':
          return stat.isFile();
        case 'directory':
          return stat.isDirectory();
        default:
          throw new Error(`Unknown object type ${type}`);
      }
    } else {
      // Otherwise, ignore the type
      return true;
    }
  } catch (ex) {
    // If this is ENOENT, that means nothing existed at the path, so return false
    if (ex.code === 'ENOENT') {
      return false;
    } else {
      throw ex;
    }
  }
}

/**
 * Determines if a given path exists and is a directory. If a different file object is there,
 * returns false.
 * @param {string} dirPath the path to check
 * @returns
 */
function directoryExists(dirPath) {
  return exists(dirPath, 'directory');
}

function fileExists(filePath) {
  return exists(filePath, 'file');
}

/**
 * Checks to see if generatedFile exists - if it doesn't, returns true. If it
 * does, checks to see if it's older than the base file, in which case it
 * returns true. If the generatedFile is newer than or as old as the base file,
 * returns false.
 * @param {string} baseFile the base file
 * @param {string} generatedFile the file that is generated
 * @return {boolean}
 */
async function isFileOutOfDate(baseFile, generatedFile) {
  let generatedStat;
  try {
    generatedStat = await fs.stat(generatedFile);
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      // Generated doesn't exist, so it's by definition out of date.
      return true;
    }
    // Otherwise, we don't know how to handle this error
    throw ex;
  }
  // ENOENT in this case is an error so let that be thrown
  const baseStat = await fs.stat(baseFile);
  // Return whether the generated file modification time is before the base file modification time.
  return generatedStat.mtime < baseStat.mtime;
}

/**
 * Writes the contents to the path, only if the file does not currently exist.
 * @param {string} path
 * @param {string} contents
 */
async function writeFileIfNotExists(path, contents) {
  try {
    await fs.writeFile(path, contents, {
      encoding: 'utf8',
      flag: 'wx',
    });
    return true;
  } catch (ex) {
    // Ignore errors if the file exists, in that case, we want to not write anything
    if (ex.code === 'EEXIST') {
      return false;
    }
    throw ex;
  }
}

/**
 * Handles escaping a value for insertion into an nginx configuration file.
 * If the value has whitespace in it, it will be surrounded by quotes.
 */
function escapeNginxConfig(str) {
  // \ MUST be first otherwise we'll escape added escape characters!
  str = str.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll("'", "\\'");
  if (/\s/.test(str)) {
    // Has whitespace? Add quotes
    str = `"${str}"`;
  }
  return str;
}

function escapeXML(str) {
  return (
    str
      // & MUST be first otherwise we'll escape added escape characters!
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  );
}

function escapePowerShell(str) {
  return str.replaceAll('^', '^^').replaceAll('"', '""');
}

const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/**
 * Web app configuration
 */
class CTMSWebApp {
  constructor(name, path, branch, gitURL) {
    this.name = name;
    this.path = path;
    this.branch = branch;
    if (!this.branch) {
      // For now, default to master, a future version might try and figure
      // out what the "real" default branch is
      this.branch = 'master';
    }
    this.gitURL = gitURL;
  }

  // Clones this into whatever the root branch is. If it appears to be checked
  // out, runs git pull instead.
  async cloneBranch(installer) {
    const installPath = installer.joinPath(this.path);
    if (await directoryExists(`${installPath}/.git`)) {
      if (installer.skipGitPull) {
        return;
      }

      installer.startSubtask(`Updating ${this.name}...`);
      // First, do a fetch, because it's possible this may be specifying a new remote branch
      if ((await exec('git', ['fetch'], { cwd: installPath, throwOnError: false })) != 0) {
        installer.warning('Failed to fetch remote git data.');
      }
      // Make sure this is on the right branch before trying to pull
      try {
        const currentBranch = await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
          cwd: installPath,
          capture: true,
        });
        if (currentBranch != this.branch) {
          installer.startSubtask(`Checking out ${this.branch}...`);
          if ((await exec('git', ['checkout', this.branch], { cwd: installPath, throwOnError: false })) != 0) {
            installer.warning(`Failed to switch branch to ${this.branch}.`);
          }
        }
      } catch (ex) {
        installer.warning('Error finding current branch, may be on incorrect branch');
      }
      // Since this has already been fetched, now merge any changes
      if ((await exec('git', ['merge'], { cwd: installPath, throwOnError: false })) != 0) {
        installer.warning(`Error updating ${this.name} via Git, may be out of date`);
      }
    } else {
      installer.startSubtask(`Cloning branch ${this.branch} for ${this.name}...`);
      try {
        await exec('git', ['clone', this.gitURL, '-b', this.branch], { cwd: installer.installPath });
      } catch (ex) {
        throw new Error(`Failed to check out ${this.gitURL} for ${this.name}: ${ex}`);
      }
    }
  }

  async needsDependenciesUpdated(installer) {
    // Really this could just return the promise directly, but it reads more clearly with the async/await
    return await isFileOutOfDate(installer.joinPath(this.path, 'package.json'), installer.joinPath('node_modules'));
  }

  async runInstallDependencyCommand(installer) {
    await exec(NPM_COMMAND, ['ci'], { cwd: installer.joinPath(this.path) });
  }

  async installDependencies(installer) {
    if (await this.needsDependenciesUpdated(installer)) {
      await this.runInstallDependencyCommand(installer);
    } else {
      installer.info(`Dependenices for ${this.name} appear to be up to date.`);
    }
  }

  async runCleanCommand(installer) {
    await exec(NPM_COMMAND, ['run', 'clean'], { cwd: installer.joinPath(this.path) });
  }

  async runBuildCommand(installer) {
    await exec(NPM_COMMAND, ['run', 'build'], { cwd: installer.joinPath(this.path) });
  }

  async build(installer) {
    installer.startSubtask(`Building ${this.name}...`);
    // Clean scripts do not exist/are UNIX-specific in most things, so for now...
    //await this.runCleanCommand(installer);
    await this.runBuildCommand(installer);
  }

  /**
   * Runs through every part of the install process
   */
  async install(installer) {
    installer.startActivity(`Install ${this.name}...`);
    if (installer.noNetwork || installer.skipGitPull) {
      if (!(await directoryExists(installer.joinPath(this.path)))) {
        throw new Error(`Directory ${installer.joinPath(this.path)} does not exist and fetching is disabled.`);
      }
    } else {
      if (!installer.skipGitPull) {
        await this.cloneBranch(installer);
      }
      await this.installDependencies(installer);
    }
    if (!installer.skipBuild) {
      await this.build(installer);
    }
  }

  /**
   * Gets application-specific settings. These are intended to be set as environment variables.
   * @param {CTMSInstaller} installer
   * @returns
   */
  getAppSettings(installer) {
    const settings = {};
    if (installer.targetServer === 'IIS') {
      settings['IISNODE_BASE_URI'] = `/${this.name}`;
    }
    if (installer.hasExtraCerts) {
      settings['NODE_EXTRA_CA_CERTS'] = installer.extraCAs;
    }
    return settings;
  }

  /**
   * Get an extra NGINX directives that should be inserted into the location block.
   * Called by #generateNginxConfig(installer). Default returns an empty string.
   * @param {CTMSInstaller} installer
   * @returns
   */
  getExtraNginxSettings(installer) {
    return '';
  }

  getIndexScript(installer) {
    return 'start.js';
  }

  /**
   * Gets the path within the server this should listen to
   */
  getLocation(installer) {
    return `/${this.name}`;
  }

  /**
   * Generate configuration for the NGINX server. This contains *only* the lines needed for this
   * particular wrapper. They likely will need to be in a single server block.
   * @param {CTMSInstaller} installer
   */
  generateNginxConfig(installer) {
    const location = escapeNginxConfig(this.getLocation(installer));
    return `  location ${location} {
    passenger_enabled on;
    passenger_user ctms;
    passenger_group ctms;
    passenger_app_type node;
    passenger_base_uri ${location};
    passenger_app_root ${escapeNginxConfig(installer.joinPath(this.path))};
    passenger_startup_file ${this.getIndexScript(installer)};
${Object.entries(this.getAppSettings(installer))
  .map(([k, v]) => `    passenger_env_var ${escapeNginxConfig(k)} ${escapeNginxConfig(v)};`)
  .join('\n')}
${this.getExtraNginxSettings(installer)}
  }
`;
  }

  /**
   * Generate the contents of the web.config file.
   * @param {CTMSInstaller} installer
   * @returns
   */
  generateIISConfig(installer) {
    return `
<configuration>
  <appSettings>
    <clear />
${Object.entries(this.getAppSettings(installer))
  .map(([k, v]) => `    <add key="${escapeXML(k)}" value="${escapeXML(v)}"/>\n`)
  .join('')}
  </appSettings>
  <system.webServer>
    <handlers>
      <add name="${escapeXML(this.name)}-iisnode" path="${escapeXML(
      this.getIndexScript(installer)
    )}" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <clear />
        <rule name="${escapeXML(this.name)}-rewrite">
          <match url="/*" />
          <action type="Rewrite" url="${escapeXML(this.getIndexScript(installer))}" />
        </rule>
      </rules>
    </rewrite>${this.getExtraIISWebServerConfig(installer)}
  </system.webServer>
</configuration>
`;
  }

  getExtraIISWebServerConfig(installer) {
    return '';
  }

  async configure(installer) {
    if (installer.targetServer === 'IIS') {
      installer.startSubtask('Writing web.config file...');
      await writeFileIfNotExists(installer.joinPath(this.path, 'web.config'), this.generateIISConfig(installer));
      installer.startSubtask('Creating website within IIS...');
      await runPowerShell(`
      $siteName = "${escapePowerShell(installer.websiteName)}"
      $appName = "${escapePowerShell(this.name)}"
      $webapp = Get-WebApplication -Site $siteName -Name $appName
      if (-Not $webapp) {
          $physical_path = Resolve-Path "${escapePowerShell(installer.joinPath(this.path))}"
          $webapp = New-WebApplication -Site $siteName -Name $appName -PhysicalPath $physical_path
      }
      `);
    }
  }
}

// Extends the base webapp with wrapper-specific details
class CTMSWrapper extends CTMSWebApp {
  constructor(name, branch, localEnv) {
    super(
      name,
      `clinical-trial-matching-service-${name}`,
      branch,
      `https://github.com/mcode/clinical-trial-matching-service-${name}.git`
    );
    this.localEnv = localEnv;
  }

  async configure(installer) {
    // Let the base inmplementation deal with the generic stuff
    await super.configure(installer);
    if (this.localEnv) {
      const localEnvKeys = Object.keys(this.localEnv);
      if (localEnvKeys.length > 0) {
        // Write out values to .env.local
        if (
          await writeFileIfNotExists(
            installer.joinPath(this.path, '.env.local'),
            localEnvKeys.map(k => `${k}="${this.localEnv[k]}"`).join('\n') + '\n'
          )
        ) {
          installer.info('Wrote .env.local file');
        } else {
          installer.info('Skipped .env.local, file already exists');
        }
      }
    }
  }
}

// The CTMS app. Currently an entire special case.
class CTMSApp extends CTMSWebApp {
  constructor() {
    super(
      'clinical-trial-matching-app',
      'clinical-trial-matching-app',
      'epic',
      'https://github.com/mcode/clinical-trial-matching-app.git'
    );
  }

  async runBuildCommand(installer) {
    // Next.js will ALWAYS use md4 for some hashes regardless of what we tell it to do
    // Clone the environment (simple and easy way to do that)
    const env = JSON.parse(JSON.stringify(process.env));
    env['NODE_OPTIONS'] = '--openssl-legacy-provider';
    await exec(NPM_COMMAND, ['run', 'build'], { cwd: installer.joinPath(this.path), env: env });
  }

  getAppSettings(installer) {
    const settings = {
      SESSION_SECRET_KEY: crypto.randomBytes(33).toString('base64'),
      NODE_ENV: 'production',
    };
    if (installer.hasExtraCerts) {
      settings['NODE_EXTRA_CA_CERTS'] = installer.extraCAs;
    }
    return settings;
  }

  getIndexScript() {
    return 'server.js';
  }

  /**
   * Gets the path within the server this should listen to
   */
  getLocation() {
    // return the root
    return '/';
  }

  getExtraNginxSettings(installer) {
    return `    root ${escapeNginxConfig(installer.joinPath(this.path, 'public'))};`;
  }

  getExtraIISWebServerConfig(_installer) {
    return `
    <security>
      <requestFiltering>
        <requestLimits maxQueryString="1024000" maxUrl="2048000"/>
      </requestFiltering>
    </security>`;
  }
}

/**
 * Installer object, manages installing everything
 */
class CTMSInstaller {
  hasExtraCerts = false;
  /**
   * When set, skip all steps associated with network activity (such as git pull or npm ci).
   */
  noNetwork = false;
  skipInstall = false;
  skipGitPull = false;
  skipBuild = false;
  skipWebappConfigure = false;
  /**
   * Target server. Currently either 'nginx' or 'IIS'
   */
  targetServer = 'nginx';
  /**
   * Server name. Currently solely used as the ID for the website for IIS.
   */
  websiteName = 'CTMS';
  // TTY color sequences
  _errorStyle = '\x1b[91;40m';
  _warningStyle = '\x1b[93;40m';
  _infoStyle = '\x1b[37;40m';
  _successStyle = '\x1b[32;40m';
  _resetStyle = '\x1b[0m';

  constructor(installPath, extraCAs, wrappers) {
    this.installPath = installPath;
    this.extraCAs = extraCAs;
    this.wrapperNames = wrappers;
    this.frontend = new CTMSApp();
    this.installedWrappers = [];
    this.failedWrappers = [];
    this._ttyColors = process.stdout.isTTY && process.stdout.hasColors();
    if (this._ttyColors) {
      if (process.stdout.hasColors(256)) {
        this._infoStyle = '\x1b[38:5:33m\x1b[48:5:0m';
      }
    } else {
      this._errorStyle = this._warningStyle = this._infoStyle = this._successStyle = this._resetStyle = '';
    }
  }

  error(...args) {
    process.stdout.write(`${this._errorStyle}${util.format.apply(util, args)}\n${this._resetStyle}`);
  }

  warning(...args) {
    process.stdout.write(`${this._warningStyle}${util.format.apply(util, args)}\n${this._resetStyle}`);
  }

  info(...args) {
    process.stdout.write(`${this._infoStyle}${util.format.apply(util, args)}\n${this._resetStyle}`);
  }

  startActivity(activity) {
    console.log(activity);
  }

  /**
   * Signals an operation has completed with the given status.
   * @param {string} status
   */
  done(status) {
    process.stdout.write(`${this._successStyle}${status}\n${this._resetStyle}`);
  }

  startSubtask(subtask) {
    process.stdout.write(`  ${subtask}\n`);
  }

  /**
   * Loads the wrapper configuration. The wrapper configuration is kept separate
   * to allow API keys and local machine data to be added to it.
   */
  async loadInstallerConfig() {
    try {
      const wrapperConfig = JSON.parse(await fs.readFile(this.joinPath('wrappers.json'), { encoding: 'utf8' }));
      try {
        const localWrapperConfig = JSON.parse(
          await fs.readFile(this.joinPath('wrappers.local.json'), { encoding: 'utf8' })
        );
        // Merge in the local wrapper config
        for (const k in localWrapperConfig) {
          const localConfig = localWrapperConfig[k];
          // May need to merge
          if (k in wrapperConfig && typeof localConfig === 'object' && localConfig !== null) {
            const globalConfig = wrapperConfig[k];
            // Copy over any value in the local config, entirely overwriting the global values
            for (const localKey in localConfig) {
              globalConfig[localKey] = localConfig[localKey];
            }
          } else {
            // Otherwise, just copy into the overall config directly
            // (for things like a wrapper that's only in the local config, or instances where it's overridden)
            wrapperConfig[k] = localConfig;
          }
        }
      } catch (ex) {
        if (ex.code !== 'ENOENT') {
          // Anything that isn't "doesn't exist" is an error
          this.error('Unable to load local wrapper configuration: %s', ex);
        }
      }
      // Once here, use the configuration
      this.wrappers = [];
      for (const k in wrapperConfig) {
        const config = wrapperConfig[k];
        if (config) {
          // If the config is an object, add it
          if (typeof config === 'object') {
            this.wrappers.push(new CTMSWrapper(k, config['branch'], config['env']));
          } else {
            // Any falsy value is allowed, meaning "ignore this wrapper", with the idea it was set via wrappers.local.json
            // But this is an invalid truthy value
            this.warning(`Invalid configure ${config} for ${k}: ignored!`);
          }
        }
      }
    } catch (ex) {
      this.error('Unable to load wrapper configuration: %s', ex);
      throw new Error('No wrappers available to install.');
    }
  }

  async checkExtraCerts() {
    if (!this.extraCAs) {
      // No CA certs configured, ignore
      return;
    }
    if (await fileExists(this.extraCAs)) {
      this.info(`Adding ${this.extraCAs} to NODE_EXTRA_CA_CERTS...`);
      process.env['NODE_EXTRA_CA_CERTS'] = this.extraCAs;
      this.hasExtraCerts = true;
    }
  }

  async installWrappers() {
    for (const wrapper of this.wrappers) {
      this.startActivity(`Installing ${wrapper.name}...`);
      try {
        await wrapper.install(this);
        this.installedWrappers.push(wrapper);
      } catch (ex) {
        this.error(`Unable to install ${wrapper.name}: ${ex}`);
        this.error(ex);
        this.failedWrappers.push(wrapper);
      }
    }
  }

  async installFrontend() {
    await this.frontend.install(this);
  }

  async configureWebServer() {
    switch (this.targetServer) {
      case 'nginx':
        await this.configureNginx();
        break;
      case 'IIS':
        await this.configureIIS();
        break;
      default:
      // Do nothing.
    }
  }

  async configureNginx() {
    // The entire NGINX file needs to be written out as one large configuration file,
    // so generate it first
    const wrapperConfig = [];
    for (const wrapper of this.wrappers) {
      wrapperConfig.push(await wrapper.generateNginxConfig(this));
    }
    const frontendConfig = await this.frontend.generateNginxConfig(this);
    await fs.writeFile(
      this.joinPath('nginx.conf'),
      `
# CTMS install script generated nginx configuration file
# This fill will be overwritten if the installer is re-run

server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name _;

  # Wrappers
${wrapperConfig.join('\n\n')}

  # Front-end webapp
${frontendConfig}
}
`
    );
  }

  async configureIIS() {
    this.startActivity('Configuring IIS...');
    this.startSubtask('Removing default website if it exists...');
    await runPowerShell(`$default_website = Get-Website -Name "Default Web Site"
    if ($default_website) {
      Remove-Website "Default Web Site"
    }
  `);
    this.startSubtask(`Creating ${this.websiteName} website within IIS...`);
    await runPowerShell(`$website = Get-Website -Name "${escapePowerShell(this.websiteName)}"
      if (-Not $website) {
        New-Website -Name "${escapePowerShell(this.websiteName)}" -Port 80 -PhysicalPath "${escapePowerShell(
      this.installPath
    )}\\clinical-trial-matching-app"
      } else {
        Stop-Website "${escapePowerShell(this.websiteName)}"
      }
    `);
  }

  async configureWrappers() {
    this.startActivity('Configuring wrappers...');
    for (const wrapper of this.installedWrappers) {
      try {
        this.startSubtask(`Configuring wrapper ${wrapper.name}...`);
        await wrapper.configure(this);
      } catch (ex) {
        this.error(`Unable to configure ${wrapper.name}: ${ex}`);
      }
    }
  }

  async configureFrontend() {
    this.startActivity('Configuring frontend...');
    await this.frontend.configure(this);
  }

  async makeInstallPath() {
    await fs.mkdir(this.installPath, { recursive: true });
  }

  joinPath(...childPath) {
    return path.join(this.installPath, ...childPath);
  }

  /**
   *  Runs through the entire install process.
   */
  async install() {
    if (this.targetServer != 'nginx' && this.targetServer != 'IIS') {
      throw new Error(
        `Cannot target server ${this.targetServer}: not a supported server. (Supported servers are "nginx" and "IIS".)`
      );
    }
    await this.loadInstallerConfig();
    await this.makeInstallPath();
    await this.checkExtraCerts();
    await this.installWrappers();
    await this.installFrontend();
    await this.configureWebServer();
    if (!this.skipWebappConfigure) {
      await this.configureWrappers();
      await this.configureFrontend();
    }
    // If here, everything succeeded
    console.log(this._resetStyle);
    console.log('Install Complete');
    console.log('================');
    if (this.installedWrappers.length > 0) {
      console.log('');
      console.log(`${this._successStyle}Successfully${this._resetStyle} installed the following wrappers:`);
      for (const wrapper of this.installedWrappers) {
        console.log(`  - ${this._successStyle}${wrapper.name}${this._resetStyle}`);
      }
    }
    if (this.failedWrappers.length > 0) {
      console.log('');
      console.log(`The following wrappers ${this._errorStyle}FAILED${this._resetStyle} to install:`);
      for (const wrapper of this.failedWrappers) {
        console.log(`  - ${this._errorStyle}${wrapper.name}${this._resetStyle}`);
      }
    }
    console.log('');
    console.log(`Front end app is installed in: ${this.joinPath(this.frontend.path)}`);
    console.log(
      'Check the .env and .env.local files to ensure that the front end app is configured for the expected wrappers.'
    );
  }
}

const argumentsWithValues = {
  '--install-dir': INSTALL_PATH,
  '--extra-ca-certs': EXTRA_CAS,
  '--wrappers': null,
  '--target-server': process.platform === 'win32' ? 'IIS' : 'nginx',
};

const argumentFlags = {
  '--no-network': false,
  '--no-git-pull': false,
  '--no-build': false,
  '--no-webapp-configure': false,
};

// Parse command line arguments. This is intentionally somewhat simplistic
for (let idx = 2; idx < process.argv.length; idx++) {
  // This needs to be capable of doing a look-ahead for certain arguments
  const arg = process.argv[idx];
  if (arg in argumentsWithValues) {
    // Move forward if possible
    idx++;
    if (idx < process.argv.length) {
      argumentsWithValues[arg] = process.argv[idx];
    } else {
      console.error(`${arg} requires an argument, none given.`);
    }
  } else if (arg in argumentFlags) {
    argumentFlags[arg] = true;
  }
}

const installer = new CTMSInstaller(
  argumentsWithValues['--install-dir'],
  argumentsWithValues['--extra-ca-certs'],
  argumentsWithValues['--wrappers']
);
// Copy over argument flags
installer.noNetwork = argumentFlags['--no-network'];
installer.skipGitPull = argumentFlags['--no-git-pull'];
installer.skipBuild = argumentFlags['--no-build'];
installer.skipWebappConfigure = argumentFlags['--no-webapp-configure'];
installer.targetServer = argumentsWithValues['--target-server'];

installer
  .install()
  .then(() => {
    console.log('Completed.');
  })
  .catch(ex => {
    console.error(`The CTMS system failed to install: ${ex}`);
    console.error(ex);
  });
