module.exports = (api) => {
  if (api.env('test')) {
    return {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['babel-plugin-rewire'],
    };
  } else {
    return {};
  }
};
