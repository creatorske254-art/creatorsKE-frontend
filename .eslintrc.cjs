module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'dist-*', '.eslintrc.cjs', 'backend', 'tmp'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  overrides: [
    // Build configs run in Node, not the browser.
    { files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js'], env: { node: true } },
    // These modules intentionally export a provider or component together with its hook or
    // constants (AuthProvider + useAuth, SettingsShell + useSettingsActions, ...); main.jsx is
    // the entry point. Fast refresh falls back to a full reload for them, which is fine.
    {
      files: ['src/context/*.jsx', 'src/main.jsx', 'src/components/settings/SettingsShell.jsx', 'src/components/settings/PreferenceCards.jsx'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-console': 'warn',
    'react/prop-types': 'off', // using JSDoc / zod for type safety instead
  },
}
