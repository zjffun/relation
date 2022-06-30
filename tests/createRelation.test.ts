import { expect } from "chai";
import { createRelation } from "../src/createRelation.js";
import { relationTestRepoPath } from "./common.js";

it("createRelation", async function () {
  expect(
    await createRelation({
      srcRev: "HEAD",
      rev: "HEAD",
      srcPath: "./markdown/README.md",
      path: "./markdown/README.zh-CN.md",
      cwd: relationTestRepoPath,
    })
  ).to.be.not.throw;
});
