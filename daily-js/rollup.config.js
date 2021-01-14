import replace from '@rollup/plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonJS from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { version } from './package-lock.json';

const production = process.env.NODE_ENV || 'production';

export default [
  {
    input: 'src/module.js',
    output: [{ file: 'dist/daily-iframe-esm.js', format: 'es' }],
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(production),
        __dailyJsVersion__: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env'],
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
      production && terser(), // minify in production
    ],
  },
];
