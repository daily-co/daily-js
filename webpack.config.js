// todo: add debug target

const path = require('path');
const webpack = require('webpack');
const version = require('./package-lock.json').version;
const mode = process.env.NODE_ENV || 'production';

const bundle = {
  mode: mode,
  devtool: mode === 'development' ? 'eval-source-map' : false,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'daily-iframe.js',
    library: 'DailyIframe',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __dailyJsVersion__: JSON.stringify(version),
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
            presets: ['@babel/preset-env'],
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

module.exports = [bundle];
