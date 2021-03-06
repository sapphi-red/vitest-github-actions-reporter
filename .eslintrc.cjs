module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error'
  },
  overrides: [
    {
      // root files
      files: ['*.{js,cjs}'],
      excludedFiles: ['*/**/*.{js,cjs}'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  ignorePatterns: ['dist', 'node_modules'],
  reportUnusedDisableDirectives: true
}
