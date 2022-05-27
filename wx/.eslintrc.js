module.exports = {
  env: {
    es2021: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint', // 词法解析器使用babel-eslint，以更好的适配es6的新api
    ecmaVersion: 12, // 启用 ES6 语法支持
    sourceType: 'module', // 设置为 "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)。
  },
  extends: ['airbnb-base', 'eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  globals: {
    wx: true,
    App: true,
    Page: true,
    getCurrentPages: true,
    getApp: true,
    Component: true,
    Behavior: true,
    requirePlugin: true,
    requireMiniProgram: true,
    copy: true,
  },
  // Then ESLint resolve from miniprogram directory. You can require miniprogram/hoge/moge.js by writing const moge = require('hoge/moge'); and ESLint knows it
  settings: {
    'import/resolver': {
      node: {
        paths: ['miniprogram'],
      },
    },
  },
  rules: {
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true,
      },
    ],
    'no-bitwise': ['off', { allow: ['~', '&', '<<', '|', '>>'] }], // 允许的位运算符
    'no-shadow': [
      'off',
      { builtinGlobals: true, hoist: 'functions', allow: ['event', 'name'] },
    ],
    'no-console': ['off', { allow: ['log', 'warn', 'error'] }],
    'no-param-reassign': ['error', { props: false }],
    'func-names': ['error', 'as-needed', { generators: 'as-needed' }],
    'no-void': ['off'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/no-extraneous-dependencies': ['off'],
    'import/prefer-default-export': ['off'],
    'consistent-return': ['off'],
  },
};
