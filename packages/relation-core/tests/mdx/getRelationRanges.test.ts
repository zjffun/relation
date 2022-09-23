import { expect } from "chai";
import { getRelationRanges } from "../../src/mdx/getRelationRanges.js";

describe("getRelationRanges", function() {
  it("md should work", async function() {
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

  it("md with metadata(frontmatter) should work", async function() {
    const srcContent = `---
title: title
---

content

h1
===

h2
---`;

    const content = `---
title: title
---
content

h1
===
h2
---`;

    const relationRanges = await getRelationRanges(srcContent, content);

    expect(relationRanges).to.be.eql([
      { fromRange: [1, 5], toRange: [1, 4] },
      { fromRange: [7, 8], toRange: [6, 7] },
      { fromRange: [10, 11], toRange: [8, 9] },
    ]);
  });
});
