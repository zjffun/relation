import { expect } from "chai";
import { check } from "../src/check";

it.only("check", function () {
  process.env.NODE_ENV = "test";

  expect(check()).to.be.eql([]);
});
