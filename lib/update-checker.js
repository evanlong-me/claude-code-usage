
const https = require('https');
const chalk = require('chalk');
const { createSpinner } = require('nanospinner');
const { name, version } = require('../package.json');

const NPM_REGISTRY_URL = `https://registry.npmjs.org/${name}`;

function fetchLatestVersion() {
  return new Promise((resolve, reject) => {
    https.get(NPM_REGISTRY_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json['dist-tags'].latest);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

async function checkForUpdates() {
  const spinner = createSpinner('Checking for updates...').start();
  
  try {
    const latestVersion = await fetchLatestVersion();
    
    if (version !== latestVersion) {
      spinner.warn({ text: `New version available! Run: ${chalk.bgYellow.black.bold(` npm install -g ${name} `)}` });
      console.log('');
    } else {
      spinner.success({ text: `You're using the latest version (${version})` });
    }
  } catch (e) {
    spinner.stop();
    // Silently ignore errors - we don't want to interrupt the main functionality
  }
}

module.exports = { checkForUpdates };

