import fse from "fs-extra";
import { execSync } from "node:child_process";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const relationTestRepoPath = join(__dirname, "../../../test-repo");

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
