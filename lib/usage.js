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

async function getUsage() {
  const configPath = path.join(process.env.HOME, '.claude.json');

  if (!await fs.pathExists(configPath)) {
    throw new DetailedError();
  }

  const config = await fs.readJson(configPath);
  const _projects = config.projects || {};

  // Collect per-message details and accumulate totals
  const messages = [];
  const totals = {
    messageCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheWriteTokens: 0,
    cacheReadTokens: 0,
    models: new Set()
  };

  try {
    const projectsPath = path.join(process.env.HOME, '.claude', 'projects');
    if (await fs.pathExists(projectsPath)) {
      const projectDirs = await fs.readdir(projectsPath);

      for (const dir of projectDirs) {
        const dirPath = path.join(projectsPath, dir);
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

                  // Extract project name from cwd if available, or derive from file path
                  if (!projectName) {
                    if (data.cwd) {
                      const cwdParts = data.cwd.split('/');
                      projectName = cwdParts[cwdParts.length - 1];
                    } else {
                      // Derive from file path as fallback
                      projectName = dir;
                    }
                  }

                  // Process messages with usage data
                  if (data.message && data.message.usage) {
                    const message = data.message;
                    const usage = message.usage;

                    // Extract token counts
                    const inputTokens = usage.input_tokens || 0;
                    const outputTokens = usage.output_tokens || 0;
                    const cacheWriteTokens = usage.cache_write_tokens || usage.cache_creation_input_tokens || 0;
                    const cacheReadTokens = usage.cache_read_tokens || usage.cache_read_input_tokens || 0;

                    // Calculate cost based on Claude pricing (per token)
                    // Based on LiteLLM pricing for claude-sonnet-4-20250514
                    let cost = 0;
                    if (message.model && message.model.includes('claude-sonnet-4-20250514')) {
                      // Claude Sonnet pricing per token
                      cost += inputTokens * 0.000003; // $3 per 1M input tokens
                      cost += outputTokens * 0.000015; // $15 per 1M output tokens
                      cost += cacheWriteTokens * 0.000003; // $3 per 1M cache creation tokens
                      cost += cacheReadTokens * 0.0000003; // $0.3 per 1M cache read tokens
                    } else if (message.model && message.model.includes('claude-opus')) {
                      // Claude Opus pricing per token
                      cost += inputTokens * 0.000015; // $15 per 1M input tokens
                      cost += outputTokens * 0.000075; // $75 per 1M output tokens
                      cost += cacheWriteTokens * 0.000015; // $15 per 1M cache creation tokens
                      cost += cacheReadTokens * 0.0000015; // $1.5 per 1M cache read tokens
                    } else if (message.model && message.model.includes('claude-haiku')) {
                      // Claude Haiku pricing per token
                      cost += inputTokens * 0.00000025; // $0.25 per 1M input tokens
                      cost += outputTokens * 0.00000125; // $1.25 per 1M output tokens
                      cost += cacheWriteTokens * 0.00000025; // $0.25 per 1M cache creation tokens
                      cost += cacheReadTokens * 0.000000025; // $0.025 per 1M cache read tokens
                    } else {
                      // Default to Sonnet pricing for unknown models
                      cost += inputTokens * 0.000003;
                      cost += outputTokens * 0.000015;
                      cost += cacheWriteTokens * 0.000003;
                      cost += cacheReadTokens * 0.0000003;
                    }

                    // Extract message details
                    const messageDetails = {
                      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : null,
                      project: projectName,
                      role: message.role || null,
                      inputTokens,
                      outputTokens,
                      cacheWriteTokens,
                      cacheReadTokens,
                      model: message.model || null,
                      cost: cost
                    };

                    // Push to messages array
                    messages.push(messageDetails);

                    // Accumulate totals
                    totals.messageCount++;
                    totals.inputTokens += messageDetails.inputTokens;
                    totals.outputTokens += messageDetails.outputTokens;
                    totals.cacheWriteTokens += messageDetails.cacheWriteTokens;
                    totals.cacheReadTokens += messageDetails.cacheReadTokens;

                    // Track distinct models
                    if (messageDetails.model) {
                      totals.models.add(messageDetails.model);
                    }
                  }
                } catch (_) {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            }
          }
        } catch (_) {
          // Skip directories we can't read
          continue;
        }
      }
    }
  } catch (_) {
    // Return empty data if we can't read projects
  }

  // Convert models Set to Array for serialization
  const finalTotals = {
    messageCount: totals.messageCount,
    inputTokens: totals.inputTokens,
    outputTokens: totals.outputTokens,
    cacheWriteTokens: totals.cacheWriteTokens,
    cacheReadTokens: totals.cacheReadTokens,
    distinctModels: Array.from(totals.models)
  };

  return {
    messages,
    totals: finalTotals
  };
}

// Keep backward compatibility with existing getUsageData function
async function getUsageData() {
  const { messages, totals } = await getUsage();

  // Group messages by project for backward compatibility
  const projectData = {};

  for (const message of messages) {
    if (!projectData[message.project]) {
      projectData[message.project] = {
        name: message.project,
        messages: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        lastActivity: null
      };
    }

    const project = projectData[message.project];
    project.messages++;
    project.inputTokens += message.inputTokens;
    project.outputTokens += message.outputTokens;
    project.cacheCreationTokens += message.cacheWriteTokens;
    project.cacheReadTokens += message.cacheReadTokens;

    if (message.timestamp) {
      const timestamp = new Date(message.timestamp);
      if (!project.lastActivity || timestamp > project.lastActivity) {
        project.lastActivity = timestamp;
      }
    }
  }

  const projectDetails = Object.values(projectData).sort((a, b) => b.inputTokens - a.inputTokens);

  const result = {
    totalInputTokens: totals.inputTokens,
    totalOutputTokens: totals.outputTokens,
    projectDetails
  };

  if (totals.cacheWriteTokens > 0) {
    result.totalCacheCreationTokens = totals.cacheWriteTokens;
  }
  if (totals.cacheReadTokens > 0) {
    result.totalCacheReadTokens = totals.cacheReadTokens;
  }

  return result;
}

module.exports = { getUsage, getUsageData };
