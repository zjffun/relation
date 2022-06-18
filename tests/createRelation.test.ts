import { expect } from "chai";
import { createRelation } from "../src/createRelation.js";

it("createRelation", function () {
  process.env.NODE_ENV = "test";

  expect(
    createRelation({
      srcRev: "HEAD",
      rev: "HEAD",
      srcPath: "./markdown/README.md",
      path: "./markdown/README.zh-CN.md",
    })
  ).to.be.not.throw;
});
