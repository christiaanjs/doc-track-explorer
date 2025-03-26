// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        ignores: [
            'dist/',
            'coverage/'
        ]
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["eslint.config.mjs"]
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);