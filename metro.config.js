const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * zustand's ESM build uses `import.meta.env` inside its devtools middleware.
 *
 * On native Metro picks the package's `react-native` export condition and gets
 * the CommonJS build, but on web it picks `import` and the bundle throws
 * "Cannot use 'import.meta' outside a module" — a blank screen.
 *
 * Point web builds at zustand's CommonJS entry files directly. Scoped to this
 * one package on purpose: turning package exports off globally would change how
 * every other dependency resolves.
 */
const zustandRoot = path.dirname(require.resolve('zustand/package.json'));
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isZustand = moduleName === 'zustand' || moduleName.startsWith('zustand/');

  if (platform === 'web' && isZustand) {
    const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    return {
      type: 'sourceFile',
      filePath: path.join(zustandRoot, `${subpath}.js`),
    };
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
