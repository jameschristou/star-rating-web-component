const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.s?css$/,
        oneOf:[
          {
            issuer: /ShadowDomComponents/,
            use:[
              'raw-loader', // used for importing scss files as a string for use in constructible stylesheets
              'sass-loader'
            ]
          },
          {
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  // only enable hot in development
                  hmr: true,
                  // if hmr does not work, this is a forceful method.
                  reloadAll: true
                },
              },
              'css-loader',
              'sass-loader'
            ],
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, '../', 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  ],
  devServer: {
    contentBase: './src',
    hot: true,
    disableHostCheck: true
  },
  mode: 'development',
  devtool: 'eval-source-map'
};