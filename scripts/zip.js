#!/usr/bin/env node
// Script for creating a zip file
// Requires compress-commons, not included by default
// The install path for CTMS and its various software
let installPath = process.platform == 'win32' ? 'C:\\CTMS' : '/opt/ctms';
let wrappers = ['breastcancertrials.org', 'carebox', 'lungevity', 'trialjectory'];
let destination = 'ctms.zip';
let skipNodeModules = false;

// Installers (placed here to make updating the versions easier, eventually
// version info should probably be localized in one place but it's currently
// used by the PowerShell script)
const INSTALLER_FILES = [
  'Git-2.46.0-64-bit.exe',
  'node-v20.17.0-x64.msi',
  'iisnode-core-v0.2.26-x64.msi',
  'rewrite_amd64_en-US.msi',
];

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { ZipArchiveEntry, ZipArchiveOutputStream } = require('compress-commons');

class CTMSWebApp {
  constructor(name, path) {
    this.name = name;
    this.path = path;
  }

  async files(zip) {
    const webAppDir = path.join(zip.path, this.path);
    const files = await fsp.readdir(webAppDir, { recursive: true, withFileTypes: true });
    return files
      .filter(file => {
        if (!file.isFile()) {
          return false;
        }
        if (skipNodeModules && /\bnode_modules[\\\/]/.test(file.path)) {
          return false;
        }
        return !this.isExcluded(file);
      })
      .map(file => path.join(file.path, file.name));
  }

  isExcluded(file) {
    // Default excludes:
    // Ignore IISNode files
    if (file.path.indexOf('iisnode') >= 0) {
      return true;
    }
    // Ignore local env files
    if (/\.env.*\.local$/.test(file.name)) {
      return true;
    }
    // Ignore web.config
    if (file.name == 'web.config') {
      return true;
    }
    return false;
  }
}

class CTMSApp extends CTMSWebApp {
  constructor() {
    super('Front-End Web App', 'clinical-trial-matching-app');
  }

  isExcluded(file) {
    // Exclude sessions.db
    if (file.name == 'sessions.db') {
      return true;
    }
    // Fall back to basic overrides
    return super.isExcluded(file);
  }
}

class CTMSWrapper extends CTMSWebApp {
  constructor(name) {
    super(name, `clinical-trial-matching-service-${name}`);
  }

  isExcluded(file) {
    // Exclude all files within ctgov-cache
    if (file.path.indexOf('ctgov-cache') >= 0) {
      return true;
    }
    if (file.path.indexOf('clinicaltrial-backup-cache') >= 0) {
      return true;
    }
    // Fall back to basic overrides
    return super.isExcluded(file);
  }
}

const wrapperConfig = {
  'breastcancertrials.org': new CTMSWrapper('breastcancertrials.org'),
  carebox: new CTMSWrapper('carebox'),
  lungevity: new CTMSWrapper('lungevity'),
  trialjectory: new CTMSWrapper('trialjectory'),
};

const appConfig = new CTMSApp();

class Zipper {
  constructor(path, destination) {
    this.path = path;
    this.zipOutputStream = new ZipArchiveOutputStream({ zlib: { level: 9 } });
    let writeStream = fs.createWriteStream(destination);
    const handleError = (error) => {
      if (this.verbose) {
        console.log('Error in ZIP: %o', error);
      }
      this._zipError = error;
    };
    writeStream.on('error', handleError);
    this.zipOutputStream.pipe(writeStream);
    this.verbose = true;
    this._closePromise = new Promise((resolve, reject) => {
      this._closeResolve = resolve;
    });
    const _resolveClose = () => {
      if (this._closePromise && this._closeResolve) {
        this._closeResolve();
      }
      this._closePromise = null;
      this._closeResolve = null;
    };
    this._zipError = null;
    this.zipOutputStream.on('error', handleError);
    this.zipOutputStream.on('close', _resolveClose);
    this.zipOutputStream.on('end', _resolveClose);
  }

  async add(webApp) {
    if (this._zipError) {
      throw this._zipError;
    }
    console.log(`Finding files for ${webApp.name}...`);
    const files = await webApp.files(this);
    const total = files.length;
    console.log(`  Adding ${total} files to ZIP...`);
    let current = 0;
    let nextUpdate = new Date().getTime();
    const maxFilenameLength = (process.stdout.columns ?? 80) - 20;
    for (const file of files) {
      // Prevent this from absolutely spamming the console, which will cause slowdown with lots of tiny files
      // (Like, say, a Node.js project's node_modules directory)
      const now = new Date().getTime();
      if (nextUpdate < now) {
        process.stdout.write(
          `\rAdding ${
            file.length > maxFilenameLength ? '...' + file.substring(file.length - maxFilenameLength + 3) : file
          }... (${((current / total) * 100).toFixed(1)}%)${
            file.length < maxFilenameLength ? ''.padEnd(maxFilenameLength - file.length, ' ') : ''
          }`
        );
        nextUpdate = now + 100;
      }
      current++;
      await this.addFile(file);
    }
    process.stdout.write('\n');
  }

  addFile(file) {
    if (this._zipError) {
      // Immediately reject with that
      return Promise.reject(this._zipError);
    }
    const zipname = this.makeZipName(file);
    if (this.verbose) {
      console.log(`  Adding ${file} as ${zipname}...`);
    }
    return new Promise((resolve, reject) => {
      if (this._zipError) {
        // Immediately reject
        reject(this._zipError);
      }
      let readStream = fs.createReadStream(file);
      let resolved = false;
      readStream.on('error', (err) => {
        if (resolved) {
          return;
        }
        resolved = true;
        if (this.verbose) {
          console.log('Error reading %s: %o', file, err);
        }
        reject(err);
      });
      this.zipOutputStream.entry(new ZipArchiveEntry(zipname), readStream, (error, entry) => {
        if (resolved) {
          return;
        }
        resolved = true;
        if (error) {
          if (this.verbose) {
            console.log('Error writing entry: %o', error);
          }
          reject(error);
        } else {
          // Success
          if (this.verbose) {
            console.log('Wrote %s', zipname);
          }
          resolve(entry);
        }
      });
    });
  }

  makeZipName(fullPath) {
    // Basically, for now, strip off the drive letter
    if (fullPath.length > 3 && fullPath.substring(1, 3) == ':\\') {
      return fullPath.substring(3);
    }
    return fullPath;
  }

  close() {
    this.zipOutputStream.finish();
    return this._closePromise ?? Promise.resolve();
  }
}

async function main(args) {
  const argFlags = {
    '--exclude-node-modules': false,
    '--exclude-front-end': false,
    '--exclude-installers': false,
    '--exclude-install-scripts': false,
    '--exclude-wrappers': false,
    '--verbose': false,
    '-v': false,
  };
  for (let idx = 0; idx < args.length; idx++) {
    const arg = args[idx];
    if (arg in argFlags) {
      argFlags[arg] = true;
    } else if (args[idx] == '--wrappers') {
      if (idx + 1 < args.length) {
        wrappers = args[++idx].split(/\s*,\s*/);
        if (wrappers.length == 1 && wrappers[0] == '') {
          wrappers = [];
        }
      }
    }
  }
  skipNodeModules = argFlags['--exclude-node-modules'];
  console.log(`Creating ZIP file ${destination}...`);
  const zip = new Zipper(installPath, destination);
  zip.verbose = argFlags['--verbose'] || argFlags['-v'];
  if (!argFlags['--exclude-front-end']) {
    await zip.add(appConfig);
  }
  if (!argFlags['--exclude-wrappers']) {
    for (const wrapperName of wrappers) {
      const wrapper = wrapperConfig[wrapperName];
      if (!wrapper) {
        throw new Error(`Unknown wrapper ${wrapperName}`);
      }
      await zip.add(wrapper);
    }
  }
  if (!argFlags['--exclude-install-scripts']) {
    console.log('  Adding install script data...');
    const installScripts = ['install.ps1', 'test.ps1', 'wrappers.json'];
    try {
      if ((await fsp.stat(path.join(installPath, 'wrappers.local.json'))).isFile()) {
        installScripts.push('wrappers.local.json');
      }
    } catch (ex) {
      // ENOENT is what we're checking for, a file that doesn't exist
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
    for (const installScript of installScripts) {
      await zip.addFile(path.join(installPath, installScript));
    }
  }
  if (!argFlags['--exclude-installers']) {
    console.log('  Adding installers...');
    for (const installer of INSTALLER_FILES) {
      await zip.addFile(path.join(installPath, 'installers', installer));
    }
  }
  console.log('Finalizing ZIP file...');
  await zip.close();
}

main(process.argv.slice(2))
  .then(() => {
    console.log('Complete.');
  })
  .catch(error => {
    console.error('Failed to build ZIP file:');
    console.error(error);
  });
