# Claude Code Usage

A lightweight CLI tool for analyzing Claude Code usage statistics and costs locally.

## ✨ Features

- 🔒 **100% Local & Secure** - No API keys required, reads local Claude Code data only
- ⚡ **Quick Analysis** - View all usage statistics with a single `ccu` command
- 💰 **Accurate Cost Tracking** - Real costs + estimated pricing based on detected models
- 📊 **Project Breakdown** - Detailed usage analytics per project
- 🎯 **Smart Model Detection** - Automatically identifies actual Claude models from session records
- 🚀 **Easy to Use** - Simple installation and intuitive commands

## 🚀 Quick Start

### Global Installation (Recommended)
```bash
npm install -g claude-code-usage
ccu  # View statistics instantly
```

### One-time Usage
```bash
npx claude-code-usage
```

## 📋 Usage

```bash
# View usage statistics (default)
ccu

# Show version
ccu -v

# Show help
ccu --help
```

## 📊 Sample Output

```
Claude Code Usage Statistics

Total sessions: 12
Actual cost: $0.248937
Active projects: 3

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

Estimated costs based on detected model pricing
```

## 🎯 Smart Model Detection

The tool automatically detects your actual Claude model using:

1. **Session Records** (Most Reliable) - From `.claude/projects/*.jsonl` files
2. **Environment Variables** - `ANTHROPIC_MODEL` variable
3. **Settings File** - From `.claude/settings.json`
4. **Fallback** - Defaults to `claude-3-sonnet-20240229`

This ensures accurate pricing calculations based on your real usage.

## 🛠️ Requirements

- **Node.js** >= 14.0.0
- **Claude Code** installed and configured
- At least one Claude Code project with conversation history

## 📁 Data Sources

Reads local data from:
- `~/.claude.json` - Main Claude Code configuration
- `~/.claude/projects/` - Session records and project data
- `~/.claude/settings.json` - User settings (optional)

## 🚨 Setup Instructions

If Claude Code isn't configured, you'll see:

```
❌ Claude Code configuration not found!

📋 To fix this:

1. Install Claude Code:
   npm install -g @anthropic-ai/claude-code

2. Authenticate:
   claude
   # Follow authentication prompts

3. Start a conversation:
   claude "Hello, world!"

4. Run this tool:
   ccu
```

## 🔒 Privacy & Security

- **100% Local** - All data read from your local Claude Code files
- **No Network Calls** - No data sent anywhere
- **No API Keys** - No authentication required
- **Privacy First** - Your data stays on your machine

## 📦 Installation Options

### Global (Recommended)
```bash
npm install -g claude-code-usage
```

### Local Project
```bash
npm install claude-code-usage
npx claude-code-usage
```

### Direct Usage
```bash
npx claude-code-usage
```

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug? [Create an issue](https://github.com/evanlong-me/claude-code-usage/issues)

## 📚 Links

- [NPM Package](https://www.npmjs.com/package/claude-code-usage)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
