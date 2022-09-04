import { expect } from "chai";
import { diffLines } from "diff";
import { getLineRelations } from "../../src/core/getLineRelations.js";
import { getModifiedRange } from "../../src/core/getModifiedRange.js";

it.only("getModifiedRange", function () {
  const oldContent = `test1
test2
test3-will-be-deleted
test4-will-be-deleted
test5
test6
test7-will-be-changed
test8-will-be-changed
test9
test10
`;

  const newContent = `test1
test2
test5
test6
test7-changed
test8-changed
test9
test10
test11-added
test12-added
`;

  const changes = diffLines(oldContent, newContent);
  const linesRelation = getLineRelations(changes);

  expect(getModifiedRange(linesRelation, [1, 2])).to.be.eql([1, 2]);
  expect(getModifiedRange(linesRelation, [1, 3])).to.be.eql([1, 3]);
  expect(getModifiedRange(linesRelation, [1, 4])).to.be.eql([1, 3]);
  expect(getModifiedRange(linesRelation, [3, 9])).to.be.eql([3, 7]);
  expect(getModifiedRange(linesRelation, [8, 10])).to.be.eql([5, 8]);
});
