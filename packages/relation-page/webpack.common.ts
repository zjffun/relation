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
    relationPreviewView: "./src/relationPreviewView.tsx",
    relationDetailView: "./src/relationDetailView.tsx",
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
    // check-result index
    new HtmlWebpackPlugin({
      filename: "index.html",
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
            <script>
              window.relationLoadData = true;
            </script>
          </body>
        </html>
      `,
      chunks: ["bundle"],
    }),
    // check-result relationPreviewView
    new HtmlWebpackPlugin({
      filename: "relation-preview-view.html",
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
            <script>
              window.relationLoadData = true;
            </script>
          </body>
        </html>
      `,
      chunks: ["relationPreviewView"],
    }),
    // check-result relationDetailView
    new HtmlWebpackPlugin({
      filename: "relation-detail-view.html",
      templateContent: `
        <html>
          <body>
            <div id="root"></div>
            <script>
              window.relationLoadData = true;
            </script>
          </body>
        </html>
      `,
      chunks: ["relationDetailView"],
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
