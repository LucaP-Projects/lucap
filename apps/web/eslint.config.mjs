import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginImportX from "eslint-plugin-import-x";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
  {
    plugins: {
      // Maps the imported object to the "import" rule prefix
      "import": pluginImportX, 
    },
    rules: {
      'no-var': 'error',
      'react-hooks/rules-of-hooks': 'error',
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-floating-promises": "off",
      'no-useless-escape': 'off',
      'prefer-const': 'error',
      'no-irregular-whitespace': 'error',
      'no-trailing-spaces': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-catch': 'warn',
      'no-case-declarations': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      'react/jsx-key': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/jsx-boolean-value': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow'
        }
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            },
            {
              pattern: 'lucide-react',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'internal', 'react'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    }
  },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,

  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "dist/**",
    "lib/generated/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser, // Explicitly included for Next.js web environments
        ...globals.node,    // Explicitly included for SSR/Next.js backend
      },
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
  },

  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },

  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Modern React does not need this rule
    },
  },
];

/** @type {import("eslint").Linter.Config[]} */
export default nextJsConfig;