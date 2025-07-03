const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname),
};

config.watchFolders = [path.resolve(__dirname)];
config.server = {
  ...config.server,
  enhanceMiddleware: middleware => middleware,
};
config.watcher = {
  usePolling: true,
};

module.exports = config;