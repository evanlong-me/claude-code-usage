const fs = require('fs-extra');
const path = require('path');

async function getUsageData() {
  const configPath = path.join(process.env.HOME, '.claude.json');
  
  if (!await fs.pathExists(configPath)) {
    throw new Error('Claude configuration not found! Run Claude Code at least once.');
  }

  const config = await fs.readJson(configPath);

  const totalSessions = config.numStartups || 0;
  const projects = config.projects || {};
  const totalInputTokens = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalInputTokens || 0), 0);
  const totalOutputTokens = Object.values(projects).reduce((acc, project) => acc + (project.lastTotalOutputTokens || 0), 0);

  return {
    totalSessions,
    totalInputTokens,
    totalOutputTokens,
    projects: Object.keys(projects)
  };
}

module.exports = { getUsageData };
