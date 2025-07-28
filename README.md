# Claude Code Usage

A lightweight CLI tool for analyzing Claude Code usage statistics and costs locally.

## ✨ Features

- 🔒 **100% Local & Secure** - No API keys required, reads local Claude Code data only
- ⚡ **Quick Analysis** - View all usage statistics with a single `ccu` command
- 💰 **Cost Tracking** - Accurate cost calculation based on Claude pricing
- 📊 **Dual View Modes** - Switch between daily aggregated view and detailed message view
- 📋 **Clean Table Display** - Organized tabular output with token counts, costs, and project info
- 🔍 **Smart Filtering** - Filter by time ranges and project names
- 📈 **Flexible Sorting** - Sort by cost, time, tokens, or project name
- 🚀 **Easy to Use** - Simple installation and intuitive commands

## 🚀 Quick Start

### Global Installation (Recommended)
```bash
npm install -g claude-code-usage
ccu  # View statistics instantly
```

### Alternative Installation Methods

```bash
# One-time usage (no installation required)
npx claude-code-usage

# Local project installation
npm install claude-code-usage
npx claude-code-usage
```

## 📋 Usage

### Basic Commands

```bash
# View usage statistics (default)
ccu

# Show version
ccu -v

# Show help
ccu --help

# List all available projects
ccu --list-projects
```

### 🔍 Filtering Options

```bash
# Filter by time range
ccu -t 7d           # Last 7 days
ccu -t 1m           # Last 1 month
ccu -t 1y           # Last 1 year
ccu -t 6-8          # June to August (current year)
ccu -t july-august  # July to August (current year)
ccu -t 2024-7-2024-8      # July 2024 to August 2024
ccu -t 2024-07-01,2024-08-31  # Specific date range

# Filter by project (partial matching supported)
ccu -p myproject    # Show only messages from projects containing "myproject"
ccu -p my-website   # Show only my-website project

# Combine filters
ccu -t 1m -p my-website # Last month's my-website project data
```

### 📈 Sorting Options

```bash
# Sort by cost (highest first)
ccu -s cost -o desc

# Sort by cost (lowest first)
ccu -s cost -o asc

# Sort by total tokens
ccu -s tokens -o desc

# Sort by project name
ccu -s project -o asc

# Sort by time (default)
ccu -s time -o desc

# Combine with filtering
ccu -p my-website -s cost -o desc  # my-website project sorted by cost
```

### 📊 View Modes

```bash
# Default: aggregated view (by project and date)
ccu

# Detailed view: show individual messages
ccu --detailed
ccu -d

# Compare the difference
ccu -p WebGem           # Shows 1 aggregated entry for WebGem on 6/29/2025 (57 messages)
ccu -p WebGem -d        # Shows all 57 individual WebGem messages with timestamps
```

### 🎛️ All Options

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| `-t, --time` | Time filter | `7d`, `1m`, `1y`, `6-8`, `july-august`, etc. | - |
| `-p, --project` | Project filter | Project name (partial matching) | - |
| `-s, --sort` | Sort field | `cost`, `time`, `tokens`, `project` | `time` |
| `-o, --order` | Sort order | `asc`, `desc` | `desc` |
| `-d, --detailed` | Show individual messages | - | `false` (aggregated) |
| `--list-projects` | List all projects | - | - |

## 📊 Sample Output

```
🔍 Options applied:
  Project: my-website
  Sort: cost ↓
  Results: 3 aggregated entries (45 messages from 58 total)

┌─────────────┬─────────────┬──────────┬───────┬────────┬──────────────┬────────────┬──────────────────────────┬───────────┬───────────┐
│ Time        │ Project     │ Messages │ Input │ Output │ Cache Create │ Cache Read │ Model                    │ Total     │ Cost      │
├─────────────┼─────────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/29/2025   │ my-website  │ 15       │ 1,200 │ 400    │ 60,000       │ 20,000     │ claude-sonnet-4-20250514 │ 81,600    │ $0.249000 │
├─────────────┼─────────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/28/2025   │ my-website  │ 20       │ 800   │ 300    │ 40,000       │ 15,000     │ claude-sonnet-4-20250514 │ 56,100    │ $0.168500 │
├─────────────┼─────────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/27/2025   │ my-website  │ 10       │ 845   │ 428    │ 198,600      │ 652,976    │ claude-sonnet-4-20250514 │ 852,849   │ $0.734798 │
├─────────────┼─────────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ TOTAL       │             │ 45       │ 2,845 │ 1,128  │ 298,600      │ 687,976    │                          │ 990,549   │ $1.152298 │
└─────────────┴─────────────┴──────────┴───────┴────────┴──────────────┴────────────┴──────────────────────────┴───────────┴───────────┘
```

### 📁 Project List Output

```bash
ccu --list-projects
```

```
📁 Available projects:
  • my-website (45 messages)
  • data-analysis (8 messages)
  • chatbot-app (5 messages)
```

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

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug? [Create an issue](https://github.com/evanlong-me/claude-code-usage/issues)

## 📚 Links

- [NPM Package](https://www.npmjs.com/package/claude-code-usage)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
