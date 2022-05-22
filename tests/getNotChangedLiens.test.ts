import { relationCheck, RELATION_TYPE } from "../src/index";
import { expect } from "chai";
import { diffLines } from "diff";
import { getNotChangedLiens } from "../src/getNotChangedLiens";

it("getNotChangedLiens", function () {
  expect(getNotChangedLiens(diffLines("", "test"))).to.be.eql([]);

  expect(getNotChangedLiens(diffLines("test", "test"))).to.be.eql([[1, 1]]);

  expect(getNotChangedLiens(diffLines("test", "test-new"))).to.be.eql([]);

  expect(
    getNotChangedLiens(diffLines("test1\ntest2\ntest3", "test1\ntest3"))
  ).to.be.eql([
    [1, 1],
    [3, 3],
  ]);

  expect(
    getNotChangedLiens(diffLines("test1\ntest2\ntest3", "test1\n"))
  ).to.be.eql([[1, 1]]);

  expect(
    getNotChangedLiens(diffLines("test1\ntest2\ntest3", "test3"))
  ).to.be.eql([[3, 3]]);

  expect(
    getNotChangedLiens(
      diffLines("test1\ntest2\ntest3", "test1\ntest2\ntest2-add\ntest3")
    )
  ).to.be.eql([
    [1, 2],
    [3, 3],
  ]);
});
