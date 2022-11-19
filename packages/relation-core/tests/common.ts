import fse from "fs-extra";
import { execSync } from "node:child_process";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const relationTestRepoPath = join(__dirname, "../../../test-repo");

export const minimumFromPath = "minimum/fromTest.md";
export const minimumToPath = "minimum/toTest.md";

export const markdownFromPath = "markdown/README.md";
export const markdownToPath = "markdown/README.zh-CN.md";

export const minimumFromContent = fse
  .readFileSync(join(relationTestRepoPath, minimumFromPath), "utf-8")
  .toString();

export const minimumToContent = fse
  .readFileSync(join(relationTestRepoPath, minimumToPath), "utf-8")
  .toString();

export function writeTestFile(filePath: string, content: string) {
  const fullPath = join(relationTestRepoPath, filePath);
  fse.writeFileSync(fullPath, content);
  return fullPath;
}

export function resetTestRepo() {
  execSync("git checkout .", {
    cwd: relationTestRepoPath,
  });

  execSync("git clean -df", {
    cwd: relationTestRepoPath,
  });
}
