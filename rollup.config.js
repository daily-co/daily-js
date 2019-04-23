// todo: add minified prod target

import pkg from './package.json';

export default [
  {
    input: 'src/module.js',
    output: [{ file: pkg.module, format: 'es' }],
  },
];
