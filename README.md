# Claude Code Usage

A powerful CLI tool for managing and viewing Claude Code usage statistics with enhanced wrapper functionality.

## ✨ Features

- 📊 **Accurate Usage Statistics** - View detailed token usage and cost breakdown by project
- 🎯 **Precise Model Detection** - Automatically detects the actual Claude model used from session records
- 💰 **Real-time Cost Tracking** - Shows both actual costs and estimated pricing
- 🔧 **Enhanced Wrapper** - Install custom `ccu` command wrapper with usage statistics
- 🌐 **API Integration** - Fetch account limits and quotas from Anthropic API (optional)
- 📱 **Multiple Access Methods** - Use via npm, npx, or custom aliases

## 🚀 Quick Start

### Method 1: Global Installation (Recommended)
```bash
# Install globally
npm install -g claude-code-usage

# View usage statistics
claude-code-usage -u

# Install enhanced wrapper for 'ccu' command
claude-code-usage --install
```

### Method 2: One-time Usage
```bash
# Run directly without installation
npx claude-code-usage -u
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
