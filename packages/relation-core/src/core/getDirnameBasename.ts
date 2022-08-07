import * as path from "node:path";

export default function (filePath: string) {
  return [path.dirname(filePath), path.basename(filePath)];
}
