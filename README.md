# Claude Code Usage

A lightweight CLI tool for quickly checking Claude Code usage statistics and costs.

## ✨ Key Features

- 🔒 **Local & Secure** - No API keys required, pure local data analysis, privacy protected
- ⚡ **Quick Check** - View all usage statistics with a single command
- 💰 **Accurate Costs** - Auto-detects model versions for precise cost calculations
- 📊 **Detailed Analytics** - Project-by-project usage breakdown and cost analysis
- 🎯 **Smart Detection** - Automatically identifies actual Claude models from session records
- 🚀 **Simple to Use** - Install globally and use `ccu` command for instant access

## 🚀 Quick Start

### Install globally (Recommended)
```bash
npm install -g claude-code-usage

# View usage statistics instantly
ccu
```

### One-time usage
```bash
npx claude-code-usage
```

## 📋 Usage

```bash
# View usage statistics (default command)
ccu

# Or use the full command
claude-code-usage

# View help
ccu --help
```

## 📊 Sample Output

```
Claude Code Usage Statistics

Total sessions: 12
Actual cost: $0.248937
Active projects: 3
Detected model: claude-sonnet-4-20250514

Token Usage & Estimated Costs:
  Input:  10,036 tokens ($0.030108)
  Output: 4,002 tokens ($0.060030)
  Total:  14,038 tokens ($0.090138)

Project Breakdown (Top 5 by cost):

1. my-website
   Actual: $0.245467
   Input:  8,018 tokens ($0.024054)
   Output: 3,538 tokens ($0.053070)

2. data-analysis
   Actual: $0.002912
   Input:  1,670 tokens ($0.005010)
   Output: 394 tokens ($0.005910)

3. mobile-app
   Actual: $0.000558
   Input:  348 tokens ($0.001044)
   Output: 70 tokens ($0.001050)

Estimated costs based on detected model pricing
```

## 🎯 Smart Model Detection

The tool uses a sophisticated approach to detect the actual Claude model being used:

1. **Session Records** (Most Reliable) - Reads actual model from `.claude/projects/*.jsonl` files
2. **Environment Variables** - Checks `ANTHROPIC_MODEL` environment variable
3. **Settings File** - Reads from `.claude/settings.json`
4. **Fallback** - Defaults to `claude-3-sonnet-20240229`

This ensures accurate pricing calculations based on your real usage.

## 🛠️ Requirements

- **Node.js** >= 14.0.0
- **Claude Code** must be installed and configured
- **Active Claude Projects** for meaningful statistics

## 📁 Data Sources

The tool reads local data from:
- `~/.claude.json` - Main Claude Code configuration
- `~/.claude/projects/` - Session records and project data
- `~/.claude/settings.json` - User settings (optional)

## 🚨 Setup Instructions

If Claude Code is not configured, you'll see helpful setup instructions:

```
❌ Claude Code configuration not found!

📋 To fix this, you need to install and run Claude Code first:

1. Install Claude Code:
   • Visit: https://claude.ai/claude-code
   • Or run: npm install -g @anthropic-ai/claude-code

2. Authenticate Claude Code:
   • Run: claude
   • Follow the authentication prompts
   • Sign in with your Claude account

3. Use Claude Code at least once:
   • Start a conversation: claude "Hello, world!"
   • Or run interactively: claude
   • This will create the ~/.claude.json configuration file

4. Then run this tool again:
   • ccu
```

## 🔒 Privacy & Security

- **100% Local** - All data is read locally from your Claude Code configuration files
- **No Network Calls** - No data sent to external servers
- **No API Keys** - No need to provide any authentication credentials
- **Privacy First** - Your conversation data stays on your machine

## 📦 Installation Methods

### Global Installation (Recommended)
```bash
npm install -g claude-code-usage
```

### Local Installation
```bash
npm install claude-code-usage
npx claude-code-usage
```

### Direct Usage
```bash
npx claude-code-usage
```

## 📊 What Gets Tracked

- **Token Usage** - Input and output tokens by project
- **Actual Costs** - Real spending from Claude Code sessions
- **Project Breakdown** - Usage statistics per project
- **Session Count** - Total conversation sessions
- **Model Information** - Actual Claude model versions used

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug or have a feature request? Please create an issue on [GitHub](https://github.com/evanlong-me/claude-code-usage/issues).

## 📚 More Information

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
- [NPM Package](https://www.npmjs.com/package/claude-code-usage)

# Claude Code Usage

A lightweight CLI tool for viewing Claude Code usage statistics and cost analysis.

## ✨ Features

- 📊 **Accurate Usage Statistics** - View detailed token usage and cost breakdown by project
- 🎯 **Precise Model Detection** - Automatically detects the actual Claude model used from session records
- 💰 **Real-time Cost Tracking** - Shows both actual costs and estimated pricing
- ⚡ **Lightweight** - No external API calls, purely local data analysis
- 🚀 **Simple Command** - Easy-to-use `ccu` command for quick access
- 📱 **Multiple Access Methods** - Use via npm, npx, or global installation

## 🚀 Quick Start

### Method 1: Global Installation (Recommended)
```bash
# Install globally
npm install -g claude-code-usage

# View usage statistics instantly
ccu
```

### Method 2: One-time Usage
```bash
# Run directly without installation
npx claude-code-usage
```

## 📋 Usage

### Basic Commands

```bash
# View usage statistics
claude-code-usage -u
# or use the short command:
ccu

# Install enhanced wrapper
claude-code-usage --install

# Uninstall wrapper (restore defaults)
claude-code-usage --uninstall

# View help
claude-code-usage --help
```

### Sample Output

```
Claude Code Usage Statistics

Total sessions: 12
Actual cost: $0.248937
Active projects: 3
Detected model: claude-sonnet-4-20250514

Token Usage & Estimated Costs:
  Input:  10,036 tokens ($0.030108)
  Output: 4,002 tokens ($0.060030)
  Total:  14,038 tokens ($0.090138)

Project Breakdown (Top 5 by cost):

1. WebGem
   Actual: $0.245467
   Input:  8,018 tokens ($0.024054)
   Output: 3,538 tokens ($0.053070)

2. my-app
   Actual: $0.002912
   Input:  1,670 tokens ($0.005010)
   Output: 394 tokens ($0.005910)

Estimated costs based on detected model pricing
```

## 🎯 Model Detection

The tool uses a sophisticated multi-layer approach to detect the actual Claude model being used:

1. **Session Records** (Most Reliable) - Reads actual model from `.claude/projects/*.jsonl` files
2. **Environment Variables** - Checks `ANTHROPIC_MODEL` environment variable
3. **Settings File** - Reads from `.claude/settings.json`
4. **Fallback** - Defaults to `claude-3-sonnet-20240229`

This ensures accurate pricing calculations based on the real model you're using.

## 🔧 Enhanced Wrapper

The enhanced wrapper provides:

- **Seamless Integration** - Use `ccu` to view usage statistics
- **Backward Compatibility** - Original `claude` command functionality preserved
- **Easy Installation/Removal** - One command to install or uninstall

### Installation Process

```bash
# Install the enhanced wrapper
claude-code-usage --install
```

This creates:
- `ccu` command available globally
- Adds convenience alias for quick access
- Preserves original Claude Code functionality

### Uninstallation

```bash
# Remove wrapper and restore defaults
claude-code-usage --uninstall
```

## 🌐 API Integration (Optional)

Set your Anthropic API key to fetch additional account information:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

With API integration, you get:
- Account usage limits
- Current quotas
- Enhanced reporting

## 📦 Installation Methods

### Global Installation
```bash
npm install -g claude-code-usage
```

### Local Installation
```bash
npm install claude-code-usage
npx claude-code-usage -u
```

### Direct Usage
```bash
npx claude-code-usage -u
```

## 🛠️ Requirements

- **Node.js** >= 14.0.0
- **Claude Code** must be installed and configured
- **Active Claude Projects** for meaningful statistics

## 📁 Configuration

The tool reads configuration from:
- `~/.claude.json` - Main Claude Code configuration
- `~/.claude/projects/` - Session records and project data
- `~/.claude/settings.json` - User settings (optional)

## 🚨 Error Handling

If Claude Code is not configured, you'll see helpful setup instructions:

```
❌ Claude Code configuration not found!

📋 To fix this, you need to install and run Claude Code first:

1. Install Claude Code:
   • Visit: https://claude.ai/claude-code
   • Or run: npm install -g @anthropic-ai/claude-code

2. Authenticate Claude Code:
   • Run: claude
   • Follow the authentication prompts
   • Sign in with your Claude account

3. Use Claude Code at least once:
   • Start a conversation: claude "Hello, world!"
   • Or run interactively: claude
   • This will create the ~/.claude.json configuration file

4. Then run this tool again:
   • npx claude-code-usage -u
```

## 📊 What Gets Tracked

- **Token Usage** - Input and output tokens by project
- **Costs** - Actual spending and estimated costs
- **Projects** - All active Claude Code projects
- **Sessions** - Total conversation sessions
- **Model Information** - Actual Claude model versions used

## 🔒 Privacy

All data is read locally from your Claude Code configuration files. No data is sent to external servers unless you explicitly enable API integration with your own Anthropic API key.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug or have a feature request? Please create an issue on [GitHub](https://github.com/evanlong0803/claude-code-usage/issues).

## 📚 More Information

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [NPM Package](https://www.npmjs.com/package/claude-code-usage)
