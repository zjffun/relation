import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Configuration } from "webpack";
import { fileURLToPath } from "node:url";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Configuration | any = {
  entry: {
    bundle: "./src/index.tsx",
    form: "./src/form.tsx",
  },
  module: {
    rules: [
      {
        test: /\.s?css$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    publicPath: "./",
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
  },
  plugins: [
    // check-result
    new HtmlWebpackPlugin({
      filename: "index.html",
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
            <script src="./check-results-data.js"></script>
          </body>
        </html>
      `,
      chunks: ["bundle"],
    }),
    // form
    new HtmlWebpackPlugin({
      filename: "form.html",
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `,
      chunks: ["form"],
    }),
    new MonacoWebpackPlugin({
      languages: ["markdown"],
    }),
  ],
};

export default config;
