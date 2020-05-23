const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    StarRating: './src/StarRating.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: ['/node_modules/', '/example/'],
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  output: {
    path: path.resolve(__dirname, '../', 'dist-component'),
    publicPath: '/',
    filename: 'StarRating.js',
    libraryTarget: 'umd',
    library: 'star-rating-web-component',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'StarRating.css' })
  ]
};