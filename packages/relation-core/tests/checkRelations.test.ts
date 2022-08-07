import { expect } from "chai";
import checkRelations from "../src/checkRelations.js";
import { relationTestRepoPath } from "./common.js";

it("check", async function () {
  expect(
    await checkRelations({
      cwd: relationTestRepoPath,
    })
  ).to.be.not.throw;
});
