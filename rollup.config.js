import * as dotenv from 'dotenv';
dotenv.config();

import replace from '@rollup/plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonJS from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { version } from './package-lock.json';

const mode = process.env.NODE_ENV || 'production';
const devCallMachineUrl =
  process.env.DEV_CALL_MACHINE_URL ||
  'https://khk-local.wss.daily.co:8000/static/call-machine-object-bundle.js';

export default [
  {
    input: 'src/module.js',
    output: [{ file: 'dist/daily-iframe-esm.js', format: 'es' }],
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __dailyJsVersion__: JSON.stringify(version),
        __devCallMachineUrl__: JSON.stringify(devCallMachineUrl),
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
        presets: [
          ['@babel/preset-env', { exclude: ['transform-regenerator'] }],
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-class-properties',
        ],
      }),
      commonJS({
        include: 'node_modules/**',
        namedExports: {
          'node_modules/lodash/lodash.js': ['orderBy', 'filter'],
        },
      }),
      mode === 'production' && terser(), // minify in production
    ],
  },
];
