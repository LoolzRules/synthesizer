module.exports = {
  root: true,
  env: {
    node: true
  },
  "plugins": [
    "import",
    "vue"
  ],
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "block-spacing": "error",
    "quotes": [2, "double"],
    "eqeqeq": ["error", "always"],
    "array-bracket-spacing": ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    'standard/object-curly-even-spacing': [0],
    "space-in-parens": ["error", "always", { "exceptions": ["empty"] }],
    "space-before-function-paren": ["error", "never"],
    "no-extra-semi": "error",
    "camelcase": "error",
    "no-trailing-spaces": "error",
    "no-magic-numbers": ["error", { "ignore": [0, 1, 2] }],
    "comma-dangle": ["error", "always"],
  },
  parserOptions: {
    parser: 'babel-eslint',
  }
};
