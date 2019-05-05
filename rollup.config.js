import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV !== 'development';

export default [
  {
    input: 'src/module.js',
    output: [{ file: 'dist/daily-iframe-esm.js', format: 'es' }],
    plugins: [
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
