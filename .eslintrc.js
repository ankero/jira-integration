module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "react-app",
    "airbnb",
    "airbnb/hooks",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "prettier/react",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["react", "jsx-a11y", "prettier"],
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double", { avoidEscape: true }],
    "consistent-return": ["error", { treatUndefinedAsUnspecified: true }],
    "no-shadow": [0],
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "react/prop-types": 0,
    "import/prefer-default-export": [0],
    "no-plusplus": [0],
    "no-console": [0],
  },
};
