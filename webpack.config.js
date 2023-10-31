// todo: add debug target

require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const version = require('./package-lock.json').version;
const mode = process.env.NODE_ENV || 'production';
const devCallMachineUrl =
  process.env.DEV_CALL_MACHINE_URL ||
  'https://khk-local.wss.daily.co:8000/static/call-machine-object-bundle.js';

// whether to build with React Native Hermes support (only necessary in dev; prod already supports it)
const RN = !!process.env.RN;

function makeConfig({ legacyFileName = false } = {}) {
  return {
    mode: mode,
    devtool:
      mode === 'development' ? (RN ? 'source-map' : 'eval-source-map') : false,
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: legacyFileName ? 'daily-iframe.js' : 'daily.js',
      library: 'Daily',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    node: {
      global: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(mode),
        },
        __dailyJsVersion__: JSON.stringify(version),
        __devCallMachineUrl__: JSON.stringify(devCallMachineUrl),
        global: 'window',
      }),
      // Alias legacy `window.DailyIframe` to `window.Daily`
      new webpack.BannerPlugin({
        raw: true,
        footer: true,
        banner:
          'if (globalThis && globalThis.Daily) { globalThis.DailyIframe = globalThis.Daily; }',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { exclude: ['transform-regenerator'] }],
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        },
      ],
    },
    devServer: {
      port: process.env.PORT || 8081,
    },
  };
}

module.exports = [makeConfig({ legacyFileName: true }), makeConfig()];
