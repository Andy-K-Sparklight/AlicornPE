// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require("copy-webpack-plugin");

// noinspection JSValidateTypes
module.exports = {
  entry: "./src/main/Main.ts",
  output: {
    filename: "Main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "resources"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
  devtool: "source-map",
  mode: "development",
  target: "electron-main",
};
