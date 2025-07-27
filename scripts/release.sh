#!/bin/bash

# Intelligent release script for claude-code-usage
# This script determines the next version based on commit messages

set -e

# Default version increment
VERSION_TYPE="patch"

# Get the last tag (if any)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Determine the version increment based on commit messages since last tag
if [ -z "$LAST_TAG" ]; then
  # No previous tags, check all commits
  COMMIT_RANGE="HEAD"
else
  # Check commits since last tag
  COMMIT_RANGE="$LAST_TAG..HEAD"
fi

echo "📋 Analyzing commits since $LAST_TAG..."

# Check for breaking changes
if git log $COMMIT_RANGE --pretty=%B | grep -q 'BREAKING CHANGE'; then
  VERSION_TYPE="major"
  echo "💥 Found BREAKING CHANGE - will bump major version"
# Check for new features
elif git log $COMMIT_RANGE --pretty=%B | grep -q '^feat'; then
  VERSION_TYPE="minor"
  echo "✨ Found new features - will bump minor version"
else
  echo "🔧 Only fixes/improvements found - will bump patch version"
fi

echo "🚀 Starting release process..."
echo "📦 Determined version type: $VERSION_TYPE"

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Working directory is not clean. Please commit your changes first."
  exit 1
fi

# Update version in package.json
echo "📝 Updating version..."
npm version $VERSION_TYPE --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✨ New version: $NEW_VERSION"

# Commit the version bump
git add package.json
git commit -m "Bump version to $NEW_VERSION"

# Create and push tag
echo "🏷️  Creating tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tag
echo "⬆️  Pushing to GitHub..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Release process completed!"
echo "🎉 Version $NEW_VERSION has been tagged and pushed."
echo "📦 GitHub Actions will now publish to npm and GitHub Packages."
echo "🔗 Check the Actions tab in your GitHub repository for progress."

