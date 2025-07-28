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
  .option('-d, --detailed', 'Show detailed view with individual messages (default: aggregated by day)')
  .option('--list-projects', 'List all available projects')
  .action((options) => {
    if (options.listProjects) {
      showProjects();
    } else {
      showUsage(options);
    }
  });

// Aggregate messages by project and date (same project, same day = one row)
function aggregateMessagesByProjectAndDate(messages) {
  const aggregationMap = new Map();
  
  messages.forEach(msg => {
    // Get date string without time (YYYY-MM-DD)
    const dateStr = msg.timestamp ? new Date(msg.timestamp).toISOString().split('T')[0] : 'unknown';
    const project = msg.project || '';
    const key = `${project}||${dateStr}`; // Using || as separator to avoid conflicts
    
    if (!aggregationMap.has(key)) {
      // Create new aggregated entry
      aggregationMap.set(key, {
        timestamp: msg.timestamp, // Keep the first timestamp for the day
        project: msg.project,
        role: msg.role,
        inputTokens: 0,
        outputTokens: 0,
        cacheWriteTokens: 0,
        cacheReadTokens: 0,
        model: msg.model, // Keep the first model, could be mixed
        cost: 0,
        messageCount: 0,
        models: new Set() // Track all models used on this day
      });
    }
    
    const aggregated = aggregationMap.get(key);
    
    // Accumulate token counts and costs
    aggregated.inputTokens += msg.inputTokens || 0;
    aggregated.outputTokens += msg.outputTokens || 0;
    aggregated.cacheWriteTokens += msg.cacheWriteTokens || 0;
    aggregated.cacheReadTokens += msg.cacheReadTokens || 0;
    aggregated.cost += msg.cost || 0;
    aggregated.messageCount += 1;
    
    // Track models used
    if (msg.model) {
      aggregated.models.add(msg.model);
    }
    
    // Update timestamp to the latest one for the day
    if (msg.timestamp && new Date(msg.timestamp) > new Date(aggregated.timestamp)) {
      aggregated.timestamp = msg.timestamp;
    }
  });
  
  // Convert back to array and format model field
  const result = Array.from(aggregationMap.values()).map(entry => {
    // If multiple models were used, show count, otherwise show the model name
    if (entry.models.size > 1) {
      entry.model = `${entry.models.size} models`;
    } else if (entry.models.size === 1) {
      entry.model = Array.from(entry.models)[0];
    } else {
      entry.model = '';
    }
    
    // Remove the models Set as it's no longer needed
    delete entry.models;
    
    return entry;
  });
  
  return result;
}

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
    
    // Decide whether to aggregate or show detailed view
    let finalMessages;
    if (options.detailed) {
      // Show detailed view with individual messages
      finalMessages = filteredMessages;
    } else {
      // Default: aggregate messages by project and date
      finalMessages = aggregateMessagesByProjectAndDate(filteredMessages);
    }
    
    // Apply sorting if specified
    if (options.sort) {
      finalMessages = sorter.sortMessages(finalMessages, options.sort, options.order);
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
        if (options.detailed) {
          console.log(chalk.gray(`  Results: ${finalMessages.length} messages (from ${messages.length} total)`));
        } else {
          console.log(chalk.gray(`  Results: ${finalMessages.length} aggregated entries (${filteredMessages.length} messages from ${messages.length} total)`));
        }
      }
      console.log('');
    }

    // Display aggregated messages
    if (finalMessages.length > 0) {
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

      // Calculate totals
      let totalInput = 0;
      let totalOutput = 0;
      let totalCacheCreate = 0;
      let totalCacheRead = 0;
      let totalCost = 0;
      let grandTotal = 0;
      let totalMessages = 0;

      finalMessages.forEach(msg => {
        // Format timestamp based on detailed vs aggregated view
        let timeFormatted = '';
        if (msg.timestamp) {
          const date = new Date(msg.timestamp);
          if (options.detailed) {
            // Detailed view: show full timestamp
            timeFormatted = date.toLocaleString();
          } else {
            // Aggregated view: show date only
            timeFormatted = date.toLocaleDateString();
          }
        }

        // Calculate total tokens for this message
        const msgInput = msg.inputTokens || 0;
        const msgOutput = msg.outputTokens || 0;
        const msgCacheCreate = msg.cacheWriteTokens || 0;
        const msgCacheRead = msg.cacheReadTokens || 0;
        const totalTokens = msgInput + msgOutput + msgCacheCreate + msgCacheRead;

        // Get message count based on view mode
        const projectMsgCount = options.detailed ? 1 : (msg.messageCount || 1);

        // Add to totals
        totalInput += msgInput;
        totalOutput += msgOutput;
        totalCacheCreate += msgCacheCreate;
        totalCacheRead += msgCacheRead;
        totalCost += (msg.cost || 0);
        grandTotal += totalTokens;
        totalMessages += projectMsgCount;

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
        chalk.bold.green(totalMessages.toLocaleString()),
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
