module.exports = function (api) {
  api.cache(true);
  const env = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isProd = env === 'production';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(isProd ? [['babel-plugin-transform-remove-console', { exclude: ['error'] }]] : []),
    ],
  };
};
