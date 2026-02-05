//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: ['*.config.js', 'eslint.config.js', 'prettier.config.js', 'vite.config.js', '.output/**'],
  },
]
