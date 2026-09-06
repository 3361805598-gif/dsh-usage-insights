import type { UserConfig } from 'tsdown'

const clientExternals = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-runtime',
  '@deepseek-ai/dsh-client-runtime/client', '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-settings/client',
]

const host: UserConfig = {
  entry: { index: 'src/index.ts' }, outDir: 'lib', format: ['esm'],
  platform: 'node', target: 'es2024', dts: false, clean: true,
}

const client: UserConfig = {
  entry: { client: 'src/client/index.tsx' }, outDir: 'lib', format: 'cjs',
  platform: 'browser', target: 'es2024', dts: false, sourcemap: true, clean: false,
  deps: { neverBundle: clientExternals, alwaysBundle: (id: string) => !clientExternals.includes(id), onlyBundle: false },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: 'window.__ModuleLoader__.load({ id: "dsh-usage-analytics", factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;', codeSplitting: false,
  },
}

export default [host, client] satisfies UserConfig[]
