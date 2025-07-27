#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const usage = require('../lib/usage');
const { calculateCost } = require('llm-cost');
const { version } = require('../package.json');

program
  .name('claude-code-usage')
  .version(version)
  .description('A CLI tool for managing and viewing Claude Code usage statistics')
  .option('-u, --usage', 'Display usage statistics', showUsage)
  .option('--install <command>', 'Install enhanced wrapper', installWrapper)
  .option('--uninstall <command>', 'Uninstall enhanced wrapper', uninstallWrapper)
  .parse(process.argv);

// If no options provided, show usage by default for any command
if (process.argv.slice(2).length === 0) {
  showUsage();
}

// Helper function to calculate token costs using llm-cost
function calculateTokenCosts(inputTokens, outputTokens, model) {
  try {
    const inputCost = calculateCost({
      model: model,
      inputTokens: inputTokens
    }) || 0;
    
    const outputCost = calculateCost({
      model: model, 
      outputTokens: outputTokens
    }) || 0;
    
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost
    };
  } catch (error) {
    // Fallback to manual calculation if llm-cost fails
    const rates = getModelRates(model);
    return {
      inputCost: (inputTokens / 1000000) * rates.input,
      outputCost: (outputTokens / 1000000) * rates.output,
      totalCost: (inputTokens / 1000000) * rates.input + (outputTokens / 1000000) * rates.output
    };
  }
}

// Fallback pricing for different models (per 1M tokens)
function getModelRates(model) {
  const rates = {
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-sonnet-20240229': { input: 3, output: 15 },
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-5-sonnet-20240620': { input: 3, output: 15 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 }
  };
  
  return rates[model] || rates['claude-3-sonnet-20240229'];
}

async function showUsage() {
  const spinner = ora('Fetching usage data...').start();
  try {
    const data = await usage.getUsageData();
    spinner.stop();
    
    console.log(chalk.green('\nClaude Code Usage Statistics\n'));
    
    // Basic statistics
    console.log(`Total sessions: ${chalk.yellow(data.totalSessions.toLocaleString())}`);
    console.log(`Actual cost: ${chalk.green('$' + data.totalCost.toFixed(6))}`);
    console.log(`Active projects: ${chalk.yellow(data.projectDetails.length)}`);
    console.log(`Detected model: ${chalk.cyan(data.detectedModel)}\n`);
    
    // Token usage with pricing
    if (data.totalInputTokens > 0 || data.totalOutputTokens > 0) {
      const costs = calculateTokenCosts(data.totalInputTokens, data.totalOutputTokens, data.detectedModel);
      
      console.log(chalk.cyan('Token Usage & Estimated Costs:'));
      console.log(`  Input:  ${chalk.yellow(data.totalInputTokens.toLocaleString())} tokens ${chalk.gray('($' + costs.inputCost.toFixed(6) + ')')}`);
      console.log(`  Output: ${chalk.yellow(data.totalOutputTokens.toLocaleString())} tokens ${chalk.gray('($' + costs.outputCost.toFixed(6) + ')')}`);
      console.log(`  Total:  ${chalk.yellow((data.totalInputTokens + data.totalOutputTokens).toLocaleString())} tokens ${chalk.gray('($' + costs.totalCost.toFixed(6) + ')')}\n`);
    }
    
    // Project breakdown with pricing
    if (data.projectDetails.length > 0) {
      console.log(chalk.cyan('Project Breakdown (Top 5 by cost):'));
      
      const topProjects = data.projectDetails.slice(0, 5);
      
      topProjects.forEach((project, index) => {
        const projectCosts = calculateTokenCosts(project.inputTokens, project.outputTokens, data.detectedModel);
        
        console.log(`\n${index + 1}. ${chalk.yellow(project.name)}`);
        console.log(`   Actual: ${chalk.green('$' + project.cost.toFixed(6))}`);
        console.log(`   Input:  ${chalk.yellow(project.inputTokens.toLocaleString())} tokens ${chalk.gray('($' + projectCosts.inputCost.toFixed(6) + ')')}`);
        console.log(`   Output: ${chalk.yellow(project.outputTokens.toLocaleString())} tokens ${chalk.gray('($' + projectCosts.outputCost.toFixed(6) + ')')}`);
      });
      
      if (data.projectDetails.length > 5) {
        console.log(chalk.gray(`\n   ... and ${data.projectDetails.length - 5} more projects`));
      }
    }
    
    console.log(chalk.gray('\nEstimated costs based on detected model pricing'));
    
  } catch (error) {
    spinner.stop();
    
    if (error.name === 'DetailedError') {
      console.log(error.message);
    } else {
      console.error(chalk.red('❌ Error fetching usage data:'), error.message);
    }
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
