import { expect } from "chai";
import { diffLines } from "diff";
import { checkDirty } from "../../src/core/checkDirty.js";

it("relationCheck", function () {
  const oldContent = `test1
test2
test3
test4
test5
test6
`;

  const newContent = `test1
test2new
test3
test4
test4new1
test5
test6
`;

  const changes = diffLines(oldContent, newContent);

  expect(checkDirty({ changes, range: [1, 1] })).to.be.false;
  expect(checkDirty({ changes, range: [2, 2] })).to.be.true;
  expect(checkDirty({ changes, range: [4, 5] })).to.be.true;
  expect(checkDirty({ changes, range: [6, 6] })).to.be.false;
});
