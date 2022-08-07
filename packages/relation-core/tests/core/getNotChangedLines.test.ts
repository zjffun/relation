import { expect } from "chai";
import { diffLines } from "diff";
import { getNotChangedLines } from "../../src/core/getNotChangedLines.js";

it("getNotChangedLines", function () {
  expect(getNotChangedLines(diffLines("", "test"))).to.be.eql([]);

  expect(getNotChangedLines(diffLines("test", "test"))).to.be.eql([[1, 1]]);

  expect(getNotChangedLines(diffLines("test", "test-new"))).to.be.eql([]);

  expect(
    getNotChangedLines(diffLines("test1\ntest2\ntest3", "test1\ntest3"))
  ).to.be.eql([
    [1, 1],
    [3, 3],
  ]);

  expect(
    getNotChangedLines(diffLines("test1\ntest2\ntest3", "test1\n"))
  ).to.be.eql([[1, 1]]);

  expect(
    getNotChangedLines(diffLines("test1\ntest2\ntest3", "test3"))
  ).to.be.eql([[3, 3]]);

  expect(
    getNotChangedLines(
      diffLines("test1\ntest2\ntest3", "test1\ntest2\ntest2-add\ntest3")
    )
  ).to.be.eql([
    [1, 2],
    [3, 3],
  ]);
});
