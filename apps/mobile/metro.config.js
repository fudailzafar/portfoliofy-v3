const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo configures Metro for the monorepo on its own. The one thing it can't do
// is pick between copies of React: the shared package (and zustand, which it
// brings) has its own copy in node_modules, and two copies in one bundle break
// hooks. So every import of react, from anywhere, resolves from this app.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(__dirname, 'package.json') },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
