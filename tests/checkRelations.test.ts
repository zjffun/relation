import { expect } from "chai";
import { checkRelations } from "../src/checkRelations.js";
import { writeFileSync } from "node:fs";

it("check", function () {
  process.env.NODE_ENV = "test";

  expect(checkRelations()).to.be.not.throw;
});
