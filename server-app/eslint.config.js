import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      'no-console': ['off'], // Autoriser console.log dans un serveur
      'no-debugger': ['error'],
      'consistent-return': ['off'], // Désactiver pour les middlewares Express
      'curly': ['error'],
      'eqeqeq': ['error'],
      'no-eval': ['error'],
      'no-implied-eval': ['error'],
      'no-new-wrappers': ['error'],
      'no-throw-literal': ['error'],
      'no-undef': ['error'],
      'no-unused-expressions': ['error'],
      'no-useless-concat': ['error'],
      'radix': ['error'],
      'wrap-iife': ['error']
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', 'src/tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        beforeAll: 'readonly',
        afterEach: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  }
];