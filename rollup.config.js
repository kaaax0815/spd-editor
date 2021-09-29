import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'src/index.ts',
  output: {
    format: 'umd',
    file: 'dist/js/bundle.js'
  },
  plugins: [nodePolyfills(), typescript(), nodeResolve(), commonjs()]
};
