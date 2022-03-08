const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { ContextReplacementPlugin, BannerPlugin } = require("webpack");

module.exports = {
  entry: {
    Renderer: "./src/renderer/Renderer.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist", "release"),
  },
  module: {
    unknownContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
  },
  plugins: [
    new ContextReplacementPlugin(/keyv/),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "resources", "shared"),
          to: path.resolve(__dirname, "dist", "release"),
        },
      ],
    }),
    new BannerPlugin({
      banner:
        "@license\nCopyright (C) 2021-2022 Andy K Rarity Sparklight\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\nYou should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.",
      entryOnly: true,
      include: ["Renderer"],
    }),
  ],
  externals: { "util/types": "commonjs util/types" },
  mode: "production",
  target: "web",
};
