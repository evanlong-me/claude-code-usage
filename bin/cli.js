#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const ora = require('ora');
const usage = require('../lib/usage');

program
  .name('claude-code-usage')
  .version('1.0.0')
  .description('A CLI tool for managing and viewing Claude Code usage statistics')
  .option('-u, --usage', 'Display usage statistics', showUsage)
  .option('--install <command>', 'Install enhanced wrapper', installWrapper)
  .option('--uninstall <command>', 'Uninstall enhanced wrapper', uninstallWrapper)
  .parse(process.argv);

async function showUsage() {
  const spinner = ora('Fetching usage data...').start();
  try {
    const data = await usage.getUsageData();
    spinner.stop();
    console.log(chalk.green('\nClaude Code Usage Statistics\n'));
    console.log(`Total sessions: ${chalk.yellow(data.totalSessions)}`);
    console.log(`Total input tokens: ${chalk.yellow(data.totalInputTokens)}`);
    console.log(`Total output tokens: ${chalk.yellow(data.totalOutputTokens)}`);
    console.log(`Total projects: ${chalk.yellow(data.projects.length)}\n`);
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error fetching usage data:', error.message));
  }
}

function installWrapper(cmd) {
  console.log(`Installing ${cmd}...`);
  // Implementation for installing an enhanced wrapper
}

function uninstallWrapper(cmd) {
  console.log(`Uninstalling ${cmd}...`);
  // Implementation for uninstalling an enhanced wrapper
}
