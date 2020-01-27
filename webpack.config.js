const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// 最小化生产
const TerserJSPlugin = require("terser-webpack-plugin");
const tsConfig = require("./tsconfig.json");

module.exports = {
  mode: "development", // production or development
  entry: {
    "html-ast": path.resolve(__dirname, "src/index.ts")
  },
  // devtool: "inline-source-map", // 生成map文件
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  optimization: {
    minimizer: [new TerserJSPlugin({})]
  },
  plugins: [new CleanWebpackPlugin()],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, tsConfig.compilerOptions.outDir),
    library: "htmlAst",
    libraryTarget: "umd",
    globalObject: "this"
  }
};
