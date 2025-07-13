module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true,
    browser: false,
  },
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'jest', 'prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prettier/prettier': 'error',
    'max-len': ['error', { 'code': 100}],
  },
  overrides: [
    {
      files: ['apps/web/**/*.{js,jsx}'],
      env: { browser: true },
      extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:react/jsx-runtime',
        'plugin:prettier/recommended',
      ],
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
