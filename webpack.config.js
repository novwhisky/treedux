var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'treedux.js',
    library: 'treedux',
    libraryTarget: 'umd',
    path: __dirname + '/lib'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: { loader: 'babel-loader' }
      }
    ]
  },
  plugins: [
    // new UglifyJSPlugin({sourceMap: true})
  ]
};