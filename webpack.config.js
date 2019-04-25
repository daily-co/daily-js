// todo: add debug target

const path = require('path');
const mode = process.env.NODE_ENV || 'production';

const bundle = {
  mode: mode,
  devtool: (mode === 'development') ? 'inline-source-map' : false,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'daily-iframe.js',
    library: 'DailyIframe',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  }
};

module.exports = [ bundle ];
