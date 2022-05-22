import { relationCheck, RELATION_TYPE } from "../src/index";
import { expect } from "chai";

it("relationCheck", function () {
  const oldFile = `test1
test2
test3
test4
test5
test6
`;

  const newFile = `test1
test2new
test3
test4
test4new1
test5
test6
`;

  const relations = [
    { type: RELATION_TYPE.SECTION, start: 1, end: 1, id: 1 },
    { type: RELATION_TYPE.SECTION, start: 2, end: 2, id: 2 },
    { type: RELATION_TYPE.SECTION, start: 4, end: 5, id: 3 },
    { type: RELATION_TYPE.SECTION, start: 6, end: 6, id: 4 },
  ];

  expect(relationCheck({ oldFile, newFile, relations })).to.be.eql([
    { type: RELATION_TYPE.SECTION, start: 1, end: 1, id: 1, dirty: false },
    { type: RELATION_TYPE.SECTION, start: 2, end: 2, id: 2, dirty: true },
    { type: RELATION_TYPE.SECTION, start: 4, end: 5, id: 3, dirty: true },
    { type: RELATION_TYPE.SECTION, start: 6, end: 6, id: 4, dirty: false },
  ]);
});
