module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	plugins: ['svelte3', '@typescript-eslint', 'no-array-concat'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019,
    project: './tsconfig.json'
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		"no-restricted-globals": ["error", "closed", "event", "fdescribe", "name", "length", "location", "parent", "top"],
		'no-redeclare': 'off',
		'no-import-assign': 'off',
		'no-console': ['error', { "allow": ["warn", "error"] }],
		'array-callback-return': 'error',
    'no-array-concat/no-array-concat': 'error',
	}
};
