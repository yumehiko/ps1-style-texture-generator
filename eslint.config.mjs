import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        ImageData: 'readonly',
        performance: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        self: 'readonly',
        Worker: 'readonly',
        DedicatedWorkerGlobalScope: 'readonly',
        MessageEvent: 'readonly',
        ErrorEvent: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Window: 'readonly',
        HTMLImageElement: 'readonly',
        Event: 'readonly',
        HTMLCanvasElement: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLDivElement: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...typescript.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'release/', '*.config.js', 'electron-dev.js']
  }
]