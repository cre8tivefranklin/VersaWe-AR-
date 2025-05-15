const path = require('path');

module.exports = {
 entry: './js/script.js',
 output: {
  filename: 'bundle.js',
  path: path.resolve(__dirname, 'dist'),
 },
 mode: 'development',
 module: {
  rules: [
   {
    test: /\.js$/, // Apply this loader to all .js files
    exclude: /node_modules/, // Don't transpile code in node_modules
    use: {
     loader: 'babel-loader',
     options: {
      presets: ['@babel/preset-env'], // Use the @babel/preset-env
     },
    },
   },
  ],
 },
};