const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class DetailedError extends Error {
  constructor() {
    super();
    this.name = 'DetailedError';
    this.message = this.getDetailedMessage();
  }

  getDetailedMessage() {
    return `
${chalk.red('❌ Claude Code configuration not found!')}

${chalk.yellow('📋 To fix this, you need to install and run Claude Code first:')}

${chalk.green('1. Install Claude Code:')}
   • Visit: ${chalk.blue('https://claude.ai/claude-code')} 
   • Or run: ${chalk.cyan('npm install -g @anthropic-ai/claude-code')}

${chalk.green('2. Authenticate Claude Code:')}
   • Run: ${chalk.cyan('claude')}
   • Follow the authentication prompts
   • Sign in with your Claude account

${chalk.green('3. Use Claude Code at least once:')}
   • Start a conversation: ${chalk.cyan('claude "Hello, world!"')}
   • Or run interactively: ${chalk.cyan('claude')}
   • This will create the ${chalk.cyan('~/.claude.json')} configuration file

${chalk.green('4. Then run this tool again:')}
   • ${chalk.cyan('npx claude-code-usage -u')}

${chalk.yellow('💡 Need help?')}
   • Claude Code docs: ${chalk.blue('https://docs.anthropic.com/en/docs/claude-code/settings')}
`;
  }
}

async function getUsageData() {
  const configPath = path.join(process.env.HOME, '.claude.json');
  
  if (!await fs.pathExists(configPath)) {
    throw new DetailedError();
  }

  const config = await fs.readJson(configPath);

  const totalSessions = config.numStartups || 0;
  const projects = config.projects || {};
  
  // Calculate totals
  const totalInputTokens = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalInputTokens || 0), 0);
  const totalOutputTokens = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalOutputTokens || 0), 0);
  const totalCost = Object.values(projects).reduce((acc, project) => acc + (project.lastCost || 0), 0);
  const totalCacheCreation = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalCacheCreationInputTokens || 0), 0);
  const totalCacheRead = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalCacheReadInputTokens || 0), 0);
  
  // Prepare project details for progress bars
  const projectDetails = Object.entries(projects)
    .map(([path, data]) => ({
      name: path.split('/').pop() || path,
      fullPath: path,
      inputTokens: data.lastTotalInputTokens || 0,
      outputTokens: data.lastTotalOutputTokens || 0,
      cost: data.lastCost || 0,
      cacheCreation: data.lastTotalCacheCreationInputTokens || 0,
      cacheRead: data.lastTotalCacheReadInputTokens || 0,
      linesAdded: data.lastLinesAdded || 0,
      linesRemoved: data.lastLinesRemoved || 0
    }))
    .filter(project => project.inputTokens > 0 || project.outputTokens > 0 || project.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  // Try to detect the model being used from session records
  let detectedModel = 'claude-3-sonnet-20240229'; // Default fallback
  
  // Check environment variables for model info
  if (process.env.ANTHROPIC_MODEL) {
    detectedModel = process.env.ANTHROPIC_MODEL;
  }
  
  // Check settings for model info
  try {
    const settingsPath = path.join(process.env.HOME, '.claude', 'settings.json');
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath);
      if (settings.model) {
        detectedModel = settings.model;
      }
    }
  } catch (error) {
    // Ignore settings read errors
  }
  
  // Read actual model from session records (most reliable method)
  try {
    const projectsPath = path.join(process.env.HOME, '.claude', 'projects');
    if (await fs.pathExists(projectsPath)) {
      const projectDirs = await fs.readdir(projectsPath);
      
      // Look for the most recent session file
      let mostRecentModel = null;
      let mostRecentTime = 0;
      
      for (const dir of projectDirs) {
        const dirPath = path.join(projectsPath, dir);
        try {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            if (file.endsWith('.jsonl')) {
              const filePath = path.join(dirPath, file);
              const content = await fs.readFile(filePath, 'utf8');
              const lines = content.trim().split('\n');
              
              // Parse the last few lines to find model info
              for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
                try {
                  const line = JSON.parse(lines[i]);
                  if (line.message && line.message.model && line.timestamp) {
                    const timestamp = new Date(line.timestamp).getTime();
                    if (timestamp > mostRecentTime) {
                      mostRecentTime = timestamp;
                      mostRecentModel = line.message.model;
                    }
                  }
                } catch (parseError) {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            }
          }
        } catch (dirError) {
          // Skip directories we can't read
          continue;
        }
      }
      
      if (mostRecentModel) {
        detectedModel = mostRecentModel;
      }
    }
  } catch (error) {
    // Ignore session reading errors, use fallback
  }

  return {
    totalSessions,
    totalInputTokens,
    totalOutputTokens,
    totalCost,
    totalCacheCreation,
    totalCacheRead,
    projects: Object.keys(projects),
    projectDetails,
    detectedModel
  };
}

module.exports = { getUsageData };
