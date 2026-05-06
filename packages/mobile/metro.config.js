// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo so Metro sees packages/shared, packages/contracts
config.watchFolders = [monorepoRoot];

// 2. Resolve node_modules from both the project and monorepo root (pnpm hoisting)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Prevent duplicate React — handled by node-linker=hoisted in .npmrc
// config.resolver.disableHierarchicalLookup = true;

// 4. Exclude test files from bundling to prevent Node standard library errors
config.resolver.blockList = [/\/__tests__\/.*/, /.*\.(test|spec)\.(js|jsx|ts|tsx)$/];

module.exports = config;
