/**
 * Set WordPress presets
 */

const eslintConfig = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
};

eslintConfig.parserOptions = {
	ecmaVersion: 6,
	env: {
		browser: true,
		es2021: true,
		jest: true,
		es6: true,
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': [ '.js', '.jsx', '.ts', '.tsx' ],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: [ './tsconfig.json', 'tsconfig.eslint.json' ],
			},
		},
	},
	babelOptions: {
		presets: [
			'@wordpress/babel-preset-default',
			'@babel/preset-typescript',
		],
	},
};

module.exports = eslintConfig;
