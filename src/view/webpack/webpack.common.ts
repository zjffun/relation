import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Configuration } from "webpack";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Configuration | any = {
  entry: {
    bundle: "./src/view/index.tsx",
    form: "./src/view/form.tsx",
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
    path: path.resolve(__dirname, "../../../dist/view"),
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
  ],
};

export default config;
