import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    plugins: [
      resolve(), // allows me to bundle modules this library uses instead of forcing users to install them separately
      commonjs(), // 🔄 Converts CommonJS to ESModules
      typescript(),
    ],
    output: [
      {
        file: 'build/cjs/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'build/esm/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
    external: ['react'],
  },
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: 'build/index.d.ts',
      format: 'es',
    },
  },
];
