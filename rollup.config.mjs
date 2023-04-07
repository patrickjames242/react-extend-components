import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    plugins: [typescript()],
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
