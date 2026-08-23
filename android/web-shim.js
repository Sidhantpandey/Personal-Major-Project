// Shim for web compatibility with expo-font
if (typeof global !== 'undefined' && !global.expo) {
  global.expo = {};
}

// Prevent registerWebModule errors on web
if (typeof window !== 'undefined') {
  const expoModulesCore = require('expo-modules-core');
  if (expoModulesCore && !expoModulesCore.registerWebModule) {
    expoModulesCore.registerWebModule = () => {};
  }
}
