const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

const monorepoPackages = {
  '@hyper-space-wave/core': path.resolve(monorepoRoot, 'packages/core/src'),
  '@hyper-space-wave/assets': path.resolve(monorepoRoot, 'packages/assets/dist'),
};

config.watchFolders = [projectRoot, ...Object.values(monorepoPackages)];
config.resolver.extraNodeModules = monorepoPackages;

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.transformer.getTransformOptions = () => ({
  transform: {
    experimentalImportSupport: true,
  },
});

module.exports = config;
