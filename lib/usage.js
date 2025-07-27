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
   • run: ${chalk.cyan('npm install -g @anthropic-ai/claude-code')}

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
  const projects = config.projects || {};
  
  // Analyze message records from .claude/projects directory
  async function analyzeMessageRecords() {
    const projectData = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheCreationTokens = 0;
    let totalCacheReadTokens = 0;
    let allModels = new Set();
    
    try {
      const projectsPath = path.join(process.env.HOME, '.claude', 'projects');
      if (await fs.pathExists(projectsPath)) {
        const projectDirs = await fs.readdir(projectsPath);
        
        for (const dir of projectDirs) {
          const dirPath = path.join(projectsPath, dir);
          let projectInputTokens = 0;
          let projectOutputTokens = 0;
          let projectCacheCreation = 0;
          let projectCacheRead = 0;
          let projectMessages = 0;
          let projectModels = new Set();
          let lastActivity = null;
          let projectName = null;
          
          try {
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
              if (file.endsWith('.jsonl')) {
                const filePath = path.join(dirPath, file);
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.trim().split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line);
                    
                    // Extract project name from cwd if available
                    if (data.cwd && !projectName) {
                      const cwdParts = data.cwd.split('/');
                      projectName = cwdParts[cwdParts.length - 1];
                    }
                    
                    // Only process messages with usage data
                    if (data.message && data.message.usage) {
                      const usage = data.message.usage;
                      const model = data.message.model;
                      
                      projectMessages++;
                      
                      if (usage.input_tokens) {
                        projectInputTokens += usage.input_tokens;
                        totalInputTokens += usage.input_tokens;
                      }
                      
                      if (usage.output_tokens) {
                        projectOutputTokens += usage.output_tokens;
                        totalOutputTokens += usage.output_tokens;
                      }
                      
                      if (usage.cache_creation_input_tokens) {
                        projectCacheCreation += usage.cache_creation_input_tokens;
                        totalCacheCreationTokens += usage.cache_creation_input_tokens;
                      }
                      
                      if (usage.cache_read_input_tokens) {
                        projectCacheRead += usage.cache_read_input_tokens;
                        totalCacheReadTokens += usage.cache_read_input_tokens;
                      }
                      
                      if (model) {
                        projectModels.add(model);
                        allModels.add(model);
                      }
                      
                      if (data.timestamp) {
                        const timestamp = new Date(data.timestamp);
                        if (!lastActivity || timestamp > lastActivity) {
                          lastActivity = timestamp;
                        }
                      }
                    }
                  } catch (parseError) {
                    // Skip invalid JSON lines
                    continue;
                  }
                }
              }
            }
            
            // Only include projects with actual data
            if (projectMessages > 0) {
              projectData[dir] = {
                name: projectName || dir,
                messages: projectMessages,
                inputTokens: projectInputTokens,
                outputTokens: projectOutputTokens,
                cacheCreationTokens: projectCacheCreation,
                cacheReadTokens: projectCacheRead,
                models: Array.from(projectModels),
                lastActivity: lastActivity
              };
            }
          } catch (dirError) {
            // Skip directories we can't read
            continue;
          }
        }
      }
    } catch (error) {
      // Return empty data if we can't read projects
    }
    
    return {
      projects: projectData,
      totals: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cacheCreationTokens: totalCacheCreationTokens,
        cacheReadTokens: totalCacheReadTokens
      },
      models: Array.from(allModels)
    };
  }

  const messageData = await analyzeMessageRecords();
  
  // Get actual costs from config if available
  const configCosts = {};
  let totalConfigCost = 0;
  
  for (const [projectPath, data] of Object.entries(projects)) {
    if (data.lastCost && data.lastCost > 0) {
      const projectName = projectPath.split('/').pop() || projectPath;
      configCosts[projectName] = data.lastCost;
      totalConfigCost += data.lastCost;
    }
  }
  
  // Prepare project details from message data
  const projectDetails = [];
  for (const [projectName, data] of Object.entries(messageData.projects)) {
    const projectInfo = {
      name: data.name,
      messages: data.messages,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      models: data.models,
      lastActivity: data.lastActivity
    };
    
    // Add cache data if available
    if (data.cacheCreationTokens > 0) {
      projectInfo.cacheCreationTokens = data.cacheCreationTokens;
    }
    if (data.cacheReadTokens > 0) {
      projectInfo.cacheReadTokens = data.cacheReadTokens;
    }
    
    // Add actual cost if available
    if (configCosts[projectName]) {
      projectInfo.actualCost = configCosts[projectName];
    }
    
    projectDetails.push(projectInfo);
  }
  
  // Sort by input tokens (most active projects first)
  projectDetails.sort((a, b) => b.inputTokens - a.inputTokens);

  const result = {
    totalInputTokens: messageData.totals.inputTokens,
    totalOutputTokens: messageData.totals.outputTokens,
    models: messageData.models,
    projectDetails
  };
  
  // Add totals only if they exist
  if (messageData.totals.cacheCreationTokens > 0) {
    result.totalCacheCreationTokens = messageData.totals.cacheCreationTokens;
  }
  if (messageData.totals.cacheReadTokens > 0) {
    result.totalCacheReadTokens = messageData.totals.cacheReadTokens;
  }
  if (totalConfigCost > 0) {
    result.totalActualCost = totalConfigCost;
  }
  if (config.numStartups) {
    result.totalSessions = config.numStartups;
  }
  
  return result;
}

module.exports = { getUsageData };
