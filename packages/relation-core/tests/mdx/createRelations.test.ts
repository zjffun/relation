import { expect } from "chai";
import path from "node:path";
import createMarkdownRelations from "../../src/mdx/createRelations.js";
import {
  markdownFromPath,
  markdownToPath,
  relationTestRepoPath,
} from "../common.js";

describe("createRelations", () => {
  it("should work", async function() {
    const relations = await createMarkdownRelations({
      workingDirectory: relationTestRepoPath,
      fromAbsolutePath: path.join(relationTestRepoPath, markdownFromPath),
      toAbsolutePath: path.join(relationTestRepoPath, markdownToPath),
    });

    expect(relations[0].fromGitRev).to.be.an("string");
    expect(relations[0].toGitRev).to.be.an("string");
  });
});
