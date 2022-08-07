import { expect } from "chai";
import { getRelationRanges } from "../../src/mdx/getRelationRanges.js";

it("getRelationRanges", async function () {
  const srcContent = `# h1

content1
content1
content1

## h2

content2

# h1

content3`;

  const content = `# h1

content1

## h2

content2

# h1

content3`;

  const relationRanges = await getRelationRanges(srcContent, content);

  expect(relationRanges).to.be.eql([
    {
      toRange: [1, 3],
      fromRange: [1, 5],
    },
    {
      toRange: [5, 7],
      fromRange: [7, 9],
    },
    {
      toRange: [9, 11],
      fromRange: [11, 13],
    },
  ]);
});
