module.exports = {
  env: {
    jest: true
  },
  settings: {
    "import/resolver": {
      alias: [
        ['@', './src']
      ]
    }
  }
};
