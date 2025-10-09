const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: {
    main: './src/main/main.js',
    preload: './src/main/preload.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
