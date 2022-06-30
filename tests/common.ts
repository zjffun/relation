import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const relationTestRepoPath = join(
  __dirname,
  "../tests/relation-test-repo"
);
