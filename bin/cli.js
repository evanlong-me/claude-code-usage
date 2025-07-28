#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const usage = require('../lib/usage');
const filters = require('../lib/filters');
const sorter = require('../lib/sorter');
const { version } = require('../package.json');

program
  .name('claude-code-usage')
  .version(version, '-v, --version', 'display version number')
  .description('A CLI tool for viewing Claude Code usage statistics')
  .option('-t, --time <filter>', 'Time filter (e.g., 7d, 1m, 1y, 7-8, july-august, 2024-7-2024-8)')
  .option('-p, --project <name>', 'Project name filter (partial matching supported)')
  .option('-s, --sort <field>', 'Sort by field (cost, time, tokens, project)', 'time')
  .option('-o, --order <direction>', 'Sort order (asc, desc)', 'desc')
  .option('--list-projects', 'List all available projects')
  .action((options) => {
    if (options.listProjects) {
      showProjects();
    } else {
      showUsage(options);
    }
  });

// If no options provided, show usage by default
if (process.argv.slice(2).length === 0) {
  showUsage({});
} else {
  program.parse(process.argv);
}

async function showUsage(options) {
  const spinner = ora('Fetching usage data...').start();
  try {
    const { messages } = await usage.getUsage();
    
    // Apply filters
    let filteredMessages = filters.applyFilters(messages, {
      timeFilter: options.time,
      projectFilter: options.project
    });
    
    // Apply sorting if specified
    if (options.sort) {
      filteredMessages = sorter.sortMessages(filteredMessages, options.sort, options.order);
    }
    
    spinner.stop();
    
    // Show filter and sort info if applied
    if (options.time || options.project || (options.sort && options.sort !== 'time') || (options.order && options.order !== 'desc')) {
      console.log(chalk.cyan('🔍 Options applied:'));
      if (options.time) {
        console.log(chalk.gray(`  Time: ${options.time}`));
      }
      if (options.project) {
        console.log(chalk.gray(`  Project: ${options.project}`));
      }
      if (options.sort || options.order) {
        const sortBy = options.sort || 'time';
        const sortOrder = options.order || 'desc';
        const sortIcon = sortOrder === 'asc' ? '↑' : '↓';
        console.log(chalk.gray(`  Sort: ${sortBy} ${sortIcon}`));
      }
      
      if (options.time || options.project) {
        console.log(chalk.gray(`  Results: ${filteredMessages.length} messages (${messages.length} total)`));
      }
      console.log('');
    }

    // Display filtered messages
    if (filteredMessages.length > 0) {
      const table = new Table({
        head: [
          chalk.white('Time'),
          chalk.white('Project'),
          chalk.white('Messages'),
          chalk.white('Input'),
          chalk.white('Output'),
          chalk.white('Cache Create'),
          chalk.white('Cache Read'),
          chalk.white('Model'),
          chalk.white('Total'),
          chalk.white('Cost')
        ],
        style: {
          head: [],
          border: ['gray']
        }
      });

      // Calculate project message counts for filtered messages
      const projectMessageCounts = {};
      filteredMessages.forEach(msg => {
        const project = msg.project || '';
        projectMessageCounts[project] = (projectMessageCounts[project] || 0) + 1;
      });

      // Calculate totals
      let totalInput = 0;
      let totalOutput = 0;
      let totalCacheCreate = 0;
      let totalCacheRead = 0;
      let totalCost = 0;
      let grandTotal = 0;

      filteredMessages.forEach(msg => {
        // Format timestamp to be more readable
        let timeFormatted = '';
        if (msg.timestamp) {
          const date = new Date(msg.timestamp);
          timeFormatted = date.toLocaleString();
        }

        // Calculate total tokens for this message
        const msgInput = msg.inputTokens || 0;
        const msgOutput = msg.outputTokens || 0;
        const msgCacheCreate = msg.cacheWriteTokens || 0;
        const msgCacheRead = msg.cacheReadTokens || 0;
        const totalTokens = msgInput + msgOutput + msgCacheCreate + msgCacheRead;

        // Add to totals
        totalInput += msgInput;
        totalOutput += msgOutput;
        totalCacheCreate += msgCacheCreate;
        totalCacheRead += msgCacheRead;
        totalCost += (msg.cost || 0);
        grandTotal += totalTokens;

        // Get message count for this project
        const projectMsgCount = projectMessageCounts[msg.project || ''] || 0;

        // Format cost as currency
        const costFormatted = '$' + (msg.cost || 0).toFixed(6);

        table.push([
          chalk.gray(timeFormatted),
          chalk.yellow(msg.project || ''),
          chalk.white(projectMsgCount.toLocaleString()),
          chalk.yellow(msgInput.toLocaleString()),
          chalk.yellow(msgOutput.toLocaleString()),
          chalk.yellow(msgCacheCreate.toLocaleString()),
          chalk.yellow(msgCacheRead.toLocaleString()),
          chalk.white(msg.model || ''),
          chalk.green(totalTokens.toLocaleString()),
          chalk.green(costFormatted)
        ]);
      });

      // Add total row
      const totalCostFormatted = '$' + totalCost.toFixed(6);
      
      table.push([
        chalk.bold.cyan('TOTAL'),
        chalk.bold.cyan(''),
        chalk.bold.green(filteredMessages.length.toLocaleString()),
        chalk.bold.green(totalInput.toLocaleString()),
        chalk.bold.green(totalOutput.toLocaleString()),
        chalk.bold.green(totalCacheCreate.toLocaleString()),
        chalk.bold.green(totalCacheRead.toLocaleString()),
        chalk.bold.cyan(''),
        chalk.bold.green(grandTotal.toLocaleString()),
        chalk.bold.green(totalCostFormatted)
      ]);

      console.log(table.toString());
    } else {
      console.log(chalk.yellow('📭 No messages found matching the specified filters.'));
      
      if (options.time || options.project) {
        console.log(chalk.gray('\nTry adjusting your filters:'));
        console.log(chalk.gray('  • Use broader time ranges (e.g., 1m instead of 7d)'));
        console.log(chalk.gray('  • Check project name spelling'));
        console.log(chalk.gray('  • Use --list-projects to see available projects'));
      }
    }

  } catch (error) {
    spinner.stop();

    if (error.name === 'DetailedError') {
      console.log(error.message);
    } else {
      console.error(chalk.red('❌ Error fetching usage data:'), error.message);
    }
  }
}

async function showProjects() {
  const spinner = ora('Fetching project list...').start();
  try {
    const { messages } = await usage.getUsage();
    const projects = filters.getAvailableProjects(messages);
    spinner.stop();
    
    if (projects.length > 0) {
      console.log(chalk.cyan('📁 Available projects:'));
      projects.forEach(project => {
        const count = messages.filter(msg => msg.project === project).length;
        console.log(chalk.yellow(`  • ${project}`) + chalk.gray(` (${count} messages)`));
      });
    } else {
      console.log(chalk.yellow('No projects found.'));
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ Error fetching projects:'), error.message);
  }
}
