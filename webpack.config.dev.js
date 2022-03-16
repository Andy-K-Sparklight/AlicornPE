const path = require("path");
const { ContextReplacementPlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Html = require("html-webpack-plugin");
const Inline = require("html-inline-script-webpack-plugin");

module.exports = {
  entry: {
    Renderer: "./src/renderer/Renderer.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    pathinfo: false,
  },
  module: {
    unknownContextCritical: false,
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new ContextReplacementPlugin(/keyv/),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "resources", "shared"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    new Html({
      filename: "Renderer.html",
      template: "resources/build/Renderer.html",
    }),
    new Inline(),
  ],
  devtool: "cheap-source-map",
  mode: "development",
  target: "web",
  watchOptions: {
    ignored: ["**/node_modules", "**/dist"],
  },
  externals: { "util/types": "commonjs util/types" },
};
