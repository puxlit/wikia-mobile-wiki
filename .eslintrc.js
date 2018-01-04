module.exports = {
	root: true,
	parserOptions: {
		sourceType: 'module'
	},
	plugins: [
		'ember'
	],
	extends: [
		'airbnb-base',
		'plugin:ember/recommended'
	],
	env: {
		es6: true,
		browser: true,
		jquery: true
	},
	globals: {
		$script: true,
		Ember: true,
		FastBoot: true,
		ga: true,
		Hammer: true,
		M: true,
		VisitSource: true,
		Weppy: true,
		Wikia: true
	},
	rules: {
		"arrow-parens": [2, "always"],
		"array-callback-return": 0,
		"arrow-body-style": 0,
		"class-methods-use-this": 0,
		"comma-dangle": 0,
		"consistent-return": 0,
		"func-names": 0,
		"function-paren-newline": [2, "consistent"],
		"global-require": 0,
		"import/extensions": 0,
		"import/first": 0,
		"import/no-extraneous-dependencies": 0,
		"import/no-mutable-exports": 0,
		"import/no-unresolved": 0,
		"indent": [2, "tab", {"VariableDeclarator": 1, "SwitchCase": 1, "CallExpression": {"arguments": 1}}],
		"linebreak-style": 0,
		"max-len": [2, 120, 2],
		"new-cap": 0,
		"newline-per-chained-call": 0,
		"no-alert": 0,
		"no-cond-assign": 0,
		"no-else-return": 0,
		"no-mixed-operators": 0,
		"no-multiple-empty-lines": 0,
		"no-param-reassign": 0,
		"no-plusplus": [2, {"allowForLoopAfterthoughts": true}],
		"no-prototype-builtins": 0,
		"no-restricted-properties": 0,
		"no-restricted-syntax": 0,
		"no-shadow": 0,
		"no-tabs": 0,
		"no-underscore-dangle": 0,
		"no-unneeded-ternary": 0,
		"no-unused-vars": 0,
		"object-curly-spacing": [2, "never"],
		"object-curly-newline": 0,
		"object-shorthand": [2, 'always'],
		"one-var": 0,
		"one-var-declaration-per-line": 0,
		"padded-blocks": 0,
		"prefer-destructuring": 0,
		"prefer-const": 0,
		"prefer-rest-params": 0,
		"quotes": [2, "single", {"allowTemplateLiterals": true}],
		"wrap-iife": [2, "inside"],

		// Ember rules
		// Disabled for now as it is broken with new imports
		// https://github.com/ember-cli/eslint-plugin-ember/pull/186
		"ember/no-global-jquery": 0,
    "ember/order-in-components": 1,
    "ember/order-in-controllers": 1
		"ember/order-in-routes": 1
	}
};
