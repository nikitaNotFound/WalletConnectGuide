const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const path = require('path');

module.exports = {
  context: __dirname,
  devtool: "inline-source-map",
  entry: "./src/js/main.js",
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    runtimeChunk: 'single',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: 'src/index.html'
    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/icons', to: 'icons' },
      ],
    }),
  ],
  module:{
    rules: [
      {
        test: /\.s[ac]ss$/i,
        exclude: '/node_modules/',
        use: [MiniCssExtractPlugin.loader,'css-loader', 'sass-loader'],
      },
    ],
  },
  devServer: {
    static: './dist',
    watchFiles: ['src/*.html']
  },
  optimization: {
    runtimeChunk: 'single',
  },
}