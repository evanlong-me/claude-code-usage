#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const ora = require('ora');
const usage = require('../lib/usage');
const { version } = require('../package.json');

program
  .name('claude-code-usage')
  .version(version, '-v, --version', 'display version number')
  .description('A CLI tool for viewing Claude Code usage statistics')
  .option('-u, --usage', 'Display usage statistics', showUsage)
  .parse(process.argv);

// If no options provided, show usage by default for any command
if (process.argv.slice(2).length === 0) {
  showUsage();
}

async function showUsage() {
  const spinner = ora('Fetching usage data...').start();
  try {
    const data = await usage.getUsageData();
    spinner.stop();
    
    console.log(chalk.green('\nClaude Code Usage Statistics\n'));
    
    // Display available basic statistics
    if (data.totalSessions) {
      console.log(`Total sessions: ${chalk.yellow(data.totalSessions.toLocaleString())}`);
    }
    
    if (data.totalActualCost) {
      console.log(`Total actual cost: ${chalk.green('$' + data.totalActualCost.toFixed(6))}`);
    }
    
    console.log(`Active projects: ${chalk.yellow(data.projectDetails.length)}`);
    
    // Token usage summary
    if (data.totalInputTokens > 0 || data.totalOutputTokens > 0) {
      console.log(chalk.cyan('\nToken Usage:'));
      if (data.totalInputTokens > 0) {
        console.log(`  Input tokens:  ${chalk.yellow(data.totalInputTokens.toLocaleString())}`);
      }
      if (data.totalOutputTokens > 0) {
        console.log(`  Output tokens: ${chalk.yellow(data.totalOutputTokens.toLocaleString())}`);
      }
      console.log(`  Total tokens:  ${chalk.yellow((data.totalInputTokens + data.totalOutputTokens).toLocaleString())}`);
    }
    
    // Cache usage if available
    if (data.totalCacheCreationTokens > 0 || data.totalCacheReadTokens > 0) {
      console.log(chalk.cyan('\nCache Usage:'));
      if (data.totalCacheCreationTokens > 0) {
        console.log(`  Cache creation: ${chalk.yellow(data.totalCacheCreationTokens.toLocaleString())} tokens`);
      }
      if (data.totalCacheReadTokens > 0) {
        console.log(`  Cache read:     ${chalk.yellow(data.totalCacheReadTokens.toLocaleString())} tokens`);
      }
    }
    
    // Project breakdown
    if (data.projectDetails.length > 0) {
      console.log(chalk.cyan('\nProject Breakdown (by token usage):'));
      
      const topProjects = data.projectDetails.slice(0, 10);
      
      topProjects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${chalk.yellow(project.name)}`);
        console.log(`   Messages: ${chalk.white(project.messages.toLocaleString())}`);
        
        if (project.inputTokens > 0) {
          console.log(`   Input:    ${chalk.yellow(project.inputTokens.toLocaleString())} tokens`);
        }
        if (project.outputTokens > 0) {
          console.log(`   Output:   ${chalk.yellow(project.outputTokens.toLocaleString())} tokens`);
        }
        
        if (project.cacheCreationTokens > 0) {
          console.log(`   Cache creation: ${chalk.yellow(project.cacheCreationTokens.toLocaleString())} tokens`);
        }
        if (project.cacheReadTokens > 0) {
          console.log(`   Cache read:     ${chalk.yellow(project.cacheReadTokens.toLocaleString())} tokens`);
        }
        
        if (project.actualCost > 0) {
          console.log(`   Actual cost:    ${chalk.green('$' + project.actualCost.toFixed(6))}`);
        }
        
        if (project.lastActivity) {
          console.log(`   Last activity: ${chalk.gray(new Date(project.lastActivity).toLocaleString())}`);
        }
      });
      
      if (data.projectDetails.length > 10) {
        console.log(chalk.gray(`\n   ... and ${data.projectDetails.length - 10} more projects`));
      }
    }
    
    console.log(chalk.gray('\nData from Claude Code message records'));
    
  } catch (error) {
    spinner.stop();
    
    if (error.name === 'DetailedError') {
      console.log(error.message);
    } else {
      console.error(chalk.red('❌ Error fetching usage data:'), error.message);
    }
  }
}
