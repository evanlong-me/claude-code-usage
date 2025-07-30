# Claude Code Usage

A lightweight CLI tool for analyzing Claude Code usage statistics and costs locally.

## ✨ Features

- 🔒 **100% Local & Secure** - No API keys required, reads local Claude Code data only
- ⚡ **Quick Analysis** - View all usage statistics with a single `ccu` command
- 💰 **Cost Tracking** - Accurate cost calculation based on Claude pricing
- 📊 **Dual View Modes** - Switch between daily aggregated view and detailed message view
- 🎯 **Smart Project Detection** - Auto-detects current project when run in project directories
- 📋 **Clean Table Display** - Organized tabular output with token counts, costs, and project info
- 🔍 **Smart Filtering** - Filter by time ranges and project names
- 📈 **Flexible Sorting** - Sort by cost, time, tokens, or project name
- 🔄 **Auto Update Check** - Automatically checks for new versions and notifies when updates are available
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

These are the basic commands you can use:

```bash
# View usage statistics (default command)
ccu

# Display version information
ccu -v

# Display help information
ccu --help

# List all available projects
ccu --list-projects
# or use the short form
ccu -lp

# List all available models with pricing
ccu --list-models
# or use the short form
ccu -lm
```

### 🔍 Filtering Options

Filter your usage data by time range and project. 

**Note**: It's recommended to wrap time filters in quotes if they contain spaces.

#### ⏰ Time Filtering Formats

The tool supports various time filtering formats for maximum flexibility:

**Relative Time Filters** (no quotes needed):
- `5min`, `30min` - Last N minutes
- `2h`, `12h` - Last N hours  
- `7d`, `30d` - Last N days
- `1m`, `6m` - Last N months
- `1y`, `2y` - Last N years

**Date Range Filters**:
- `6-8` - Month range (June to August, current year)
- `july-august`, `jan-mar` - Named month ranges
- `2024-7-2024-8` - Cross-year month ranges
- `2024-07-01,2024-08-31` - Specific date ranges

**Precise DateTime Filters** (ISO 8601 format, **recommended**):
- `2024-07-30T16:00:00,2024-07-30T18:00:00` - Second precision
- `2024-07-30T16:00,2024-07-30T18:00` - Minute precision
- `2024-07-30T16,2024-07-30T18` - Hour precision

**Human-readable DateTime** (requires quotes):
- `"2024-07-30 16:00:00,2024-07-30 18:00:00"` - Second precision
- `"2024-07-30 16:00,2024-07-30 18:00"` - Minute precision

```bash
# Filter by relative time (no quotes needed)
ccu -t 5min         # Last 5 minutes
ccu -t 2h           # Last 2 hours
ccu -t 7d           # Last 7 days
ccu -t 1m           # Last 1 month
ccu -t 1y           # Last 1 year

# Filter by month range (no quotes needed)
ccu -t 6-8          # June to August (current year)
ccu -t july-august  # July to August (current year)

# Filter by date and time (T-separator, no quotes needed)
ccu -t 2024-07-01T14:30:15,2024-07-01T16:45:30  # With seconds
ccu -t 2024-07-01T14:30,2024-07-01T16:45     # With minutes
ccu -t 2024-07-01T14,2024-07-01T16         # With hours

# Filter by date and time (space separator, quotes needed)
ccu -t "2024-07-01 14:30,2024-07-01 16:45"

# Filter by specific date range
ccu -t 2024-07-01,2024-08-31
ccu -t 2024-7-2024-8      # July 2024 to August 2024

# Filter by project (partial matching supported)
ccu -p myproject    # Show only messages from projects containing "myproject"

# Combine filters for precise results
ccu -t 1m -p my-website # Last month's my-website project data
```

### 📈 Sorting Options

Sort your results by different criteria:

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

# Combine sorting with filtering
ccu -p my-website -s cost -o desc  # my-website project sorted by cost
```

### 🎯 Project Auto-Detection

The tool automatically detects your current project and filters results accordingly:

```bash
# When run in a project directory, automatically filters to that project
cd my-project
ccu                     # Shows only my-project usage

# Show all projects explicitly
ccu --all               # Shows usage for all projects
ccu -a

# Manual project filtering still works
ccu -p specific-project # Shows only specific-project usage
```

### 📊 View Modes

Switch between different viewing modes:

```bash
# Default: aggregated view (by project and date)
ccu

# Detailed view: show individual messages
ccu --detailed
ccu -d

# Comparing views for specific projects
ccu -p my-project       # Aggregated entry for my-project
ccu -p my-project -d    # All individual my-project messages
```

### ⭐ GitHub Prompt Configuration

Manage the GitHub star prompt that appears after displaying results:

```bash
# Permanently disable the GitHub star prompt
ccu --disable-github-prompt

# Re-enable the GitHub star prompt
ccu --enable-github-prompt

# View all available options (including prompt settings)
ccu -h
```

The tool will show a friendly prompt asking you to star the repository on GitHub after displaying usage statistics. You can:

- **Keep it enabled** (default) - Helps support the project
- **Disable it permanently** - The setting is saved and respected across all future runs
- **Re-enable it anytime** - If you change your mind

Your preference is stored in `~/.claude-code-usage-config.json`.

### 🅰️ All Options Reference

Complete reference table of all available options:

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| `-t, --time` | Time filter | `5min`, `2h`, `7d`, `1m`, `1y`, `6-8`, `july-august`, `2024-07-01T14:30,2024-07-01T16:45`, etc. | - |
| `-p, --project` | Project filter | Project name (partial matching) | auto-detect |
| `-s, --sort` | Sort field | `cost`, `time`, `tokens`, `project` | `time` |
| `-o, --order` | Sort order | `asc`, `desc` | `desc` |
| `-d, --detailed` | Show individual messages | - | `false` (aggregated) |
| `-a, --all` | Show all projects | - | `false` (auto-detect) |
| `-lp, --list-projects` | List all projects | - | - |
| `-lm, --list-models` | List all available models with pricing | - | - |
| `--disable-github-prompt` | Permanently disable the GitHub star prompt | - | - |
| `--enable-github-prompt` | Re-enable the GitHub star prompt | - | - |

## 📊 Sample Output

An example of what the output may look like:

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
# or use short form: ccu -lp
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

This tool reads Claude Code usage data from your local files:

- `~/.claude.json` - Main Claude Code configuration
- `~/.claude/projects/` - Session records and project data
- `~/.claude/settings.json` - User settings (optional)

## 🚨 Setup Instructions

First time using this tool? If Claude Code isn't configured on your system, you'll see:

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

- **100% Local Data** - All Claude Code usage data read from your local files
- **Minimal Network Usage** - Only fetches model pricing from LiteLLM (cached for 1 hour)
- **No API Keys** - No authentication required
- **Privacy First** - Your usage data never leaves your machine

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug? [Create an issue](https://github.com/evanlong-me/claude-code-usage/issues)

## 📚 Links

- [NPM Package](https://www.npmjs.com/package/claude-code-usage)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)
