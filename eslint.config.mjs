import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

import typescriptEslint from '@typescript-eslint/eslint-plugin'

const defaultConfig = hmppsConfig({
  extraIgnorePaths: ['node_modules', 'public', 'assets', 'cypress.json', 'reporter-config.json', 'dist/', 'coverage'],
})
defaultConfig.push({
  rules: {
    'import/prefer-default-export': 'off',
    'dot-notation': 'off',
  },
})

defaultConfig.push({
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },
  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: 'res|next|^err|_',
        ignoreRestSiblings: true,
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-empty-object-type': [1, { allowInterfaces: 'always' }],
  },
})

export default defaultConfig
