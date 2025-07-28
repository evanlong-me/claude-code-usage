# Claude Code Usage

A lightweight CLI tool for analyzing Claude Code usage statistics and costs locally.

## ✨ Features

- 🔒 **100% Local & Secure** - No API keys required, reads local Claude Code data only
- ⚡ **Quick Analysis** - View all usage statistics with a single `ccu` command
- 💰 **Cost Tracking** - Real-time cost calculation based on Claude pricing
- 📊 **Detailed Table View** - Clean tabular display with token counts, costs, and project info
- 🔍 **Smart Filtering** - Filter by time ranges and project names
- 📈 **Flexible Sorting** - Sort by cost, time, tokens, or project name
- 🎯 **Project Management** - List and filter by specific projects
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
ccu -p WebGem       # Show only WebGem project

# Combine filters
ccu -t 1m -p WebGem # Last month's WebGem project data
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
ccu -p WebGem -s cost -o desc  # WebGem project sorted by cost
```

### 🎛️ All Options

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| `-t, --time` | Time filter | `7d`, `1m`, `1y`, `6-8`, `july-august`, etc. | - |
| `-p, --project` | Project filter | Project name (partial matching) | - |
| `-s, --sort` | Sort field | `cost`, `time`, `tokens`, `project` | `time` |
| `-o, --order` | Sort order | `asc`, `desc` | `desc` |
| `--list-projects` | List all projects | - | - |

## 📊 Sample Output

```
🔍 Options applied:
  Project: WebGem
  Sort: cost ↓
  Results: 57 messages (62 total)

┌────────────────────────┬─────────┬──────────┬───────┬────────┬──────────────┬────────────┬──────────────────────────┬───────────┬───────────┐
│ Time                   │ Project │ Messages │ Input │ Output │ Cache Create │ Cache Read │ Model                    │ Total     │ Cost      │
├────────────────────────┼─────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/29/2025, 6:35:47 PM  │ WebGem  │ 57       │ 402   │ 26     │ 20,144       │ 0          │ claude-sonnet-4-20250514 │ 20,572    │ $0.062028 │
├────────────────────────┼─────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/29/2025, 6:35:50 PM  │ WebGem  │ 57       │ 402   │ 26     │ 20,144       │ 0          │ claude-sonnet-4-20250514 │ 20,572    │ $0.062028 │
├────────────────────────┼─────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ 6/29/2025, 6:35:25 PM  │ WebGem  │ 57       │ 3     │ 1      │ 19,617       │ 0          │ claude-sonnet-4-20250514 │ 19,621    │ $0.058875 │
├────────────────────────┼─────────┼──────────┼───────┼────────┼──────────────┼────────────┼──────────────────────────┼───────────┼───────────┤
│ TOTAL                  │         │ 57       │ 3,445 │ 1,238  │ 332,600      │ 751,976    │                          │ 1,089,259 │ $1.252298 │
└────────────────────────┴─────────┴──────────┴───────┴────────┴──────────────┴────────────┴──────────────────────────┴───────────┴───────────┘
```

### 📁 Project List Output

```bash
ccu --list-projects
```

```
📁 Available projects:
  • WebGem (57 messages)
  • app-discount (1 messages)
  • evanlong (4 messages)
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
