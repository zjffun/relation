import { expect } from "chai";
import { diffLines } from "diff";
import { getLinesRelation } from "../../src/core/getLinesRelation.js";
import { getRelationRange } from "../../src/core/getRelationRange.js";

it("relationCheck", function () {
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
  const linesRelation = getLinesRelation(changes);

  expect(getRelationRange(linesRelation.oldLinesRelationMap, [1, 2])).to.be.eql(
    [1, 2]
  );
  expect(getRelationRange(linesRelation.oldLinesRelationMap, [1, 4])).to.be.eql(
    [1, 2]
  );
  expect(getRelationRange(linesRelation.oldLinesRelationMap, [3, 8])).to.be.eql(
    [3, 6]
  );
  expect(
    getRelationRange(linesRelation.oldLinesRelationMap, [8, 10])
  ).to.be.eql([5, 8]);
});
