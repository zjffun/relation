import path from "node:path";
import { fileURLToPath } from "node:url";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  output: {
    publicPath: "auto",
  },
  devServer: {
    static: path.resolve(__dirname, "./test-data"),
    // devMiddleware: {
    //   writeToDisk: true,
    // },
  },
});
