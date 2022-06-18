import { expect } from "chai";
import { getRelationRanges } from "../../src/mdx/getRelationRanges.js";

it("createRelation", async function () {
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
      range: [1, 3],
      srcRange: [1, 5],
    },
    {
      range: [5, 7],
      srcRange: [7, 9],
    },
    {
      range: [9, 11],
      srcRange: [11, 13],
    },
  ]);
});
