#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const usage = require('../lib/usage');
const filters = require('../lib/filters');
const sorter = require('../lib/sorter');
const aggregator = require('../lib/aggregator');
const projectDetector = require('../lib/project-detector');
const pricing = require('../lib/pricing');
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
  .option('-a, --all', 'Show all projects (default: auto-detect current project if in project directory)')
  .option('--list-projects', 'List all available projects')
  .option('--list-models', 'List all available models with pricing')
  .action(async (options) => {
    if (options.listProjects) {
      showProjects();
    } else if (options.listModels) {
      showModels();
    } else {
      // Apply project auto-detection
      const projectAwareOptions = await projectDetector.getProjectAwareOptions(options);
      showUsage(projectAwareOptions);
    }
  });


// If no options provided, show usage by default
if (process.argv.slice(2).length === 0) {
  (async () => {
    const options = await projectDetector.getProjectAwareOptions({});
    showUsage(options);
  })();
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
      finalMessages = aggregator.aggregateMessagesByProjectAndDate(filteredMessages);
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
        const projectDisplay = options.autoDetectedProject 
          ? `${options.project} ${chalk.dim('(auto-detected)')}`
          : options.project;
        console.log(chalk.gray(`  Project: ${projectDisplay}`));
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

async function showModels() {
  const spinner = ora('Fetching model pricing data...').start();
  try {
    const pricingData = await pricing.fetchModelPricing();
    const models = pricing.getAvailableModels(pricingData);
    spinner.stop();
    
    if (models.length > 0) {
      console.log(chalk.cyan('🤖 Available models with pricing:'));
      console.log(chalk.gray(`Data source: ${pricing.LITELLM_PRICING_URL}`));
      console.log('');
      
      const table = new Table({
        head: [
          chalk.white('Model'),
          chalk.white('Input (per 1M tokens)'),
          chalk.white('Output (per 1M tokens)'),
          chalk.white('Cache Create (per 1M)'),
          chalk.white('Cache Read (per 1M)')
        ],
        style: {
          head: [],
          border: ['gray']
        }
      });
      
      // Filter to show only Claude models
      const claudeModels = models.filter(model => 
        model.toLowerCase().includes('claude')
      );
      
      claudeModels.forEach(modelName => {
        const modelPricing = pricing.getModelPricing(modelName, pricingData);
        if (modelPricing) {
          const inputCost = modelPricing.input_cost_per_token ? 
            `$${(modelPricing.input_cost_per_token * 1000000).toFixed(2)}` : 'N/A';
          const outputCost = modelPricing.output_cost_per_token ? 
            `$${(modelPricing.output_cost_per_token * 1000000).toFixed(2)}` : 'N/A';
          const cacheCost = modelPricing.cache_creation_input_token_cost ? 
            `$${(modelPricing.cache_creation_input_token_cost * 1000000).toFixed(2)}` : 'N/A';
          const cacheReadCost = modelPricing.cache_read_input_token_cost ? 
            `$${(modelPricing.cache_read_input_token_cost * 1000000).toFixed(2)}` : 'N/A';
            
          table.push([
            chalk.yellow(modelName),
            chalk.green(inputCost),
            chalk.green(outputCost),
            chalk.cyan(cacheCost),
            chalk.cyan(cacheReadCost)
          ]);
        }
      });
      
      console.log(table.toString());
      
      if (claudeModels.length < models.length) {
        console.log(chalk.gray(`\nShowing ${claudeModels.length} Claude models out of ${models.length} total models.`));
        console.log(chalk.gray('Use --list-all-models to see all available models.'));
      }
    } else {
      console.log(chalk.yellow('No models found.'));
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ Error fetching models:'), error.message);
  }
}
