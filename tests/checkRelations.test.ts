import { expect } from "chai";
import { checkRelations } from "../src/checkRelations";
import { writeFileSync } from "node:fs";

it("check", function () {
  process.env.NODE_ENV = "test";

  expect(checkRelations()).to.be.eql([]);
});

// it.only("check print", function () {
//   process.env.NODE_ENV = "test";
//   const result = check();
//   writeFileSync(
//     "checkresult.json",
//     JSON.stringify(Array.from(result.entries()), null, 2)
//   );

//   // expect().to.be.eql([]);
// });
