const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 尝试从不同来源获取 API Key
async function getApiKey() {
  // 1. 尝试从环境变量获取
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // 2. 尝试从 Claude Code 配置获取
  try {
    const configPath = path.join(process.env.HOME, '.claude.json');
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      
      // 检查是否有 API key 相关信息
      if (config.apiKey) {
        return config.apiKey;
      }
    }
  } catch (error) {
    // 忽略配置文件读取错误
  }

  // 3. 尝试从 Claude settings 获取
  try {
    const settingsPath = path.join(process.env.HOME, '.claude', 'settings.json');
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath);
      if (settings.env && settings.env.ANTHROPIC_API_KEY) {
        return settings.env.ANTHROPIC_API_KEY;
      }
    }
  } catch (error) {
    // 忽略设置文件读取错误
  }

  return null;
}

// 获取账户使用情况
async function getAccountUsage() {
  try {
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      return {
        error: 'API_KEY_NOT_FOUND',
        message: 'No API key found. Please set ANTHROPIC_API_KEY environment variable or configure it in Claude Code.'
      };
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // 注意：Anthropic API 目前可能没有直接的用量查询端点
    // 这里我们尝试一个简单的请求来验证 API key 是否有效
    try {
      // 发起一个最小的请求来测试连接和获取一些信息
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{
          role: 'user',
          content: 'test'
        }]
      });

      // 如果请求成功，说明 API key 有效
      return {
        success: true,
        apiKeyValid: true,
        // 注意：实际的用量信息需要通过其他方式获取
        // 这里暂时返回占位符信息
        usage: {
          totalLimit: 'Not available via API',
          currentUsage: 'Check Claude dashboard',
          remainingQuota: 'Check Claude dashboard'
        }
      };

    } catch (apiError) {
      return {
        error: 'API_ERROR',
        message: `API request failed: ${apiError.message}`,
        details: apiError.type || 'unknown_error'
      };
    }

  } catch (error) {
    return {
      error: 'GENERAL_ERROR',
      message: `Failed to get account usage: ${error.message}`
    };
  }
}

// 获取用量统计的辅助信息
async function getUsageQuota() {
  const result = await getAccountUsage();
  
  if (result.error) {
    return {
      hasQuotaInfo: false,
      errorMessage: result.message,
      suggestion: getQuotaSuggestion(result.error)
    };
  }

  return {
    hasQuotaInfo: true,
    apiKeyValid: result.apiKeyValid,
    usage: result.usage
  };
}

function getQuotaSuggestion(errorType) {
  switch (errorType) {
    case 'API_KEY_NOT_FOUND':
      return `
${chalk.yellow('💡 To see quota information:')}
   • Set your API key: ${chalk.cyan('export ANTHROPIC_API_KEY=your-key-here')}
   • Or visit ${chalk.blue('https://console.anthropic.com')} to view usage
   • API keys can be created at ${chalk.blue('https://console.anthropic.com/settings/keys')}`;
    
    case 'API_ERROR':
      return `
${chalk.yellow('💡 API access issues:')}
   • Check your API key is valid at ${chalk.blue('https://console.anthropic.com/settings/keys')}
   • Verify your account has sufficient credits
   • Check your internet connection`;
    
    default:
      return `
${chalk.yellow('💡 For quota information:')}
   • Visit ${chalk.blue('https://console.anthropic.com')} to view detailed usage
   • Check your subscription status and remaining credits`;
  }
}

module.exports = {
  getAccountUsage,
  getUsageQuota,
  getApiKey
};
