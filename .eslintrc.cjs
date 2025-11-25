module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-restricted-syntax': [
      'error',
      {
        selector: "TSAsExpression TSAsExpression[typeAnnotation.typeName.name='unknown']",
        message: "Do not use 'as unknown as <type>'. This pattern is unsafe.",
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
