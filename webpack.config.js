// We are using node's native package 'path'
// https://nodejs.org/api/path.html
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin'); // Import our plugin -> ADDED IN THIS STEP
const ExtractTextPlugin = require('extract-text-webpack-plugin'); //  -> ADDED IN THIS STEP


// Constant with our paths
const paths = {
  DIST: path.resolve(__dirname, '.'),
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src/js'),
};

// Webpack configuration
module.exports = {
  entry: {
    app: path.join(paths.JS, 'app.js'),
    home: path.join(paths.JS, 'home.js'),
    clock: path.join(paths.JS, 'clock.js'),
    gallery: path.join(paths.JS, 'gallery.js')
  },
  output: {
    path: paths.DIST,
    filename: '[name].bundle.js',
  },
  // Tell webpack to use html plugin -> ADDED IN THIS STEP
  // index.html is used as a template in which it'll inject bundled app.
  // Include a plugin for each output page. Add @chunks to target, otherwise
  // it will add all chunks processed to all html files.
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
      chunks: ['app'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'home.html'),
      chunks: ['home'],
      filename: 'home.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'clock.html'),
      chunks: ['clock'],
      filename: 'clock.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'gallery.html'),
      chunks: ['gallery'],
      filename: 'gallery.html'
    }),
    new ExtractTextPlugin('style.bundle.css'), // CSS will be extracted to this bundle file -> ADDED IN THIS STEP
  ],
  // Dev server configuration -> REMOVED IN THIS STEP
  // devServer: {
  //   contentBase: paths.SRC,
  // },
  // Loaders configuration -> ADDED IN THIS STEP
    // We are telling webpack to use "babel-loader" for .js and .jsx files
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            'babel-loader',
          ],
        },
        // CSS loader to CSS files -> ADDED IN THIS STEP
        // Files will get handled by css loader and then passed to the extract text plugin
        // which will write it to the file we defined above
        {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                use: 'css-loader',
            }),
        }
      ],
    },
};