import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import pluginCypress from 'eslint-plugin-cypress';

import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs'],
        }
      },
    },
  },

  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Custom ignores:
    'next-i18next.config.js',
    'src/python-analyzer/**',
    'tools/python-analyzer/**',
    'src/canvaskit-wasm/**',
  ]),
  // Custom rules.
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['draft'],
        },
      ],
      'react/require-default-props': [
        2,
        {
          functions: 'defaultArguments',
        },
      ],
      'import/no-relative-packages': 'off',
      'no-console': 'error',
      'react/no-danger': 'error',
      'react/jsx-props-no-spreading': 'warn',
      'react/no-array-index-key': 'warn',
      '@typescript-eslint/strict-boolean-expressions': [
        'warn',
        {
          allowNumber: false,
          allowString: false,
        },
      ],
    },
  },
  {
    files: ['cypress/e2e/*.cy.ts'],
    extends: [pluginCypress.configs.recommended],
  },
]);

export default eslintConfig;
