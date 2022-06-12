import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Configuration } from "webpack";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Configuration | any = {
  entry: "./src/view/index.tsx",
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
    filename: "bundle.js",
    path: path.resolve(__dirname, "../../../dist/view"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
            <script src="./check-results-data.js"></script>
          </body>
        </html>
      `,
    }),
  ],
};

export default config;
