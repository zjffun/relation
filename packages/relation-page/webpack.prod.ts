import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import pkgInfo from "./package.json" assert { type: 'json' };

export default merge(common, {
  mode: "production",
  output: {
    publicPath: `https://cdn.jsdelivr.net/npm/relation2-page@${pkgInfo.version}/dist/`,
  },
});
