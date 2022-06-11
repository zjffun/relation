import { expect } from "chai";
import { checkRelations } from "../src/checkRelations";
import { writeFileSync } from "node:fs";

it("check", function () {
  process.env.NODE_ENV = "test";

  expect(checkRelations()).to.be.not.throw;
});

it.only("check print", function () {
  process.env.NODE_ENV = "test";
  const result = checkRelations();
  writeFileSync(
    "checkresult.json",
    JSON.stringify(
      Array.from(result.values()),
      (key, value: any) => {
        if (value instanceof Map) {
          return Array.from(value.entries());
        }
        return value;
      },
      2
    )
  );
});
