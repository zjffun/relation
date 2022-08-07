import { expect } from "chai";
import createRelation from "../src/createRelation.js";
import { relationTestRepoPath } from "./common.js";
import * as path from "node:path";

it("createRelation", async function () {
  // TODO: restore changes
  // expect(
  //   await createRelation({
  //     fromRev: "HEAD",
  //     toRev: "HEAD",
  //     fromPath: path.join(relationTestRepoPath, "./markdown/README.md"),
  //     toPath: path.join(relationTestRepoPath, "./markdown/README.zh-CN.md"),
  //     cwd: relationTestRepoPath,
  //   })
  // ).to.be.not.throw;
});
