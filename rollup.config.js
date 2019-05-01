import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import pkg from './package.json';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV !== 'development';

export default [
  {
    input: 'src/module.js',
    output: [{ file: pkg.module, format: 'es' }],
    plugins: [
      json(),
      resolve({
        preferBuiltins: false,
      }),
      commonJS({
        include: 'node_modules/**',
      }),
      production && terser(), // minify in production
    ],
  },
];
