const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

const path    = require("path")
const webpack = require("webpack")

// Removes exported JavaScript files from CSS-only entries
// in this example, entry.custom will create a corresponding empty custom.js file
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = {
  mode,
  optimization: {
    moduleIds: 'deterministic',
  },
  entry: {
    application: [
      "./app/javascript/application.js",
    ],
    "locations-index": "./app/javascript/locations-index.js",
    "locations-show": "./app/javascript/locations-show.js",
    "home-index": "./app/javascript/home-index.js",
    "about-index": "./app/javascript/about-index.js"
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|eot|woff2|woff|ttf|svg)$/i,
        use: 'file-loader',
      },
      {
        test: /\.erb$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [{
          loader: "rails-erb-loader",
          options: {
            runner: "bin/rails runner",
          },
        }],
      }
    ],
  },
  resolve: {
    // Add additional file types
    extensions: ['.js', '.jsx', '.scss', '.css'],
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name]-[contenthash].digested.js",
    sourceMapFilename: "[file]-[fullhash].map",
    hashFunction: "sha256",
    hashDigestLength: 64,
    path: path.resolve(__dirname, 'app/assets/builds'),
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new RemoveEmptyScriptsPlugin(),
  ]
}
