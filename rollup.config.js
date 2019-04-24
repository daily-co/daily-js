// todo: add minified prod target

import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import pkg from './package.json';

export default [
  {
    input: 'src/module.js',
    output: [
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonJS({
        include: 'node_modules/**'
      })
    ]
  }
];
