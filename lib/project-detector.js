/**
 * Project detector module for Claude Code usage data
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Detect current project name from various sources
 * @param {string} currentDir - Current working directory
 * @returns {string|null} Project name if detected, null otherwise
 */
async function detectCurrentProject(currentDir) {
  // Try different methods to detect project name
  
  // Method 1: Check package.json name
  try {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.name) {
        return packageJson.name;
      }
    }
  } catch (error) {
    // Ignore errors, try next method
  }
  
  // Method 2: Check git repository name
  try {
    const gitPath = path.join(currentDir, '.git');
    if (await fs.pathExists(gitPath)) {
      // Get the directory name as a fallback
      const dirName = path.basename(currentDir);
      if (dirName && dirName !== '.' && dirName !== '/') {
        return dirName;
      }
    }
  } catch (error) {
    // Ignore errors, try next method
  }
  
  // Method 3: Use directory name
  try {
    const dirName = path.basename(currentDir);
    if (dirName && dirName !== '.' && dirName !== '/' && dirName !== 'Users' && dirName !== 'home') {
      return dirName;
    }
  } catch (error) {
    // Ignore errors
  }
  
  return null;
}

/**
 * Check if current directory appears to be a project directory
 * @param {string} currentDir - Current working directory
 * @returns {boolean} True if appears to be a project directory
 */
async function isProjectDirectory(currentDir) {
  // Check for common project indicators
  const indicators = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.git',
    '.gitignore',
    'README.md',
    'README.rst',
    'Cargo.toml',
    'go.mod',
    'requirements.txt',
    'pyproject.toml',
    'Gemfile',
    'composer.json',
    'pom.xml',
    'build.gradle',
    'Makefile',
    'CMakeLists.txt'
  ];
  
  for (const indicator of indicators) {
    const indicatorPath = path.join(currentDir, indicator);
    if (await fs.pathExists(indicatorPath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get project-aware filter options
 * @param {Object} options - Original command options
 * @param {string} currentDir - Current working directory
 * @returns {Object} Updated options with project filter if applicable
 */
async function getProjectAwareOptions(options, currentDir = process.cwd()) {
  // If user explicitly specified --all, don't auto-filter
  if (options.all) {
    // Remove the --all flag from options and don't filter by project
    const { all, ...cleanOptions } = options;
    return cleanOptions;
  }
  
  // If user already specified a project filter, use it
  if (options.project) {
    return options;
  }
  
  // Check if we're in a project directory
  if (await isProjectDirectory(currentDir)) {
    const detectedProject = await detectCurrentProject(currentDir);
    if (detectedProject) {
      return {
        ...options,
        project: detectedProject,
        autoDetectedProject: true // Flag to indicate this was auto-detected
      };
    }
  }
  
  // No project detected or not in a project directory
  return options;
}

module.exports = {
  detectCurrentProject,
  isProjectDirectory,
  getProjectAwareOptions
};
