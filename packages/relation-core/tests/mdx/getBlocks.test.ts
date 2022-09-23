import { expect } from "chai";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { getBlocks } from "../../src/mdx/getBlocks.js";

describe("getBlocks", () => {
  it("empty content should work", async function() {
    const content = ``;
    const ast = await unified()
      .use(remarkParse)
      .parse(content);

    const blocks = getBlocks(ast);

    expect(blocks).to.be.eql([]);
  });

  it("one paragraph content should work", async function() {
    const content = `test\ntest`;
    const ast = await unified()
      .use(remarkParse)
      .parse(content);

    const blocks = getBlocks(ast);

    expect(blocks).to.be.eql([{ start: 1, end: 2 }]);
  });

  it("one heading content should work", async function() {
    const content = `# test`;
    const ast = await unified()
      .use(remarkParse)
      .parse(content);

    const blocks = getBlocks(ast);

    expect(blocks).to.be.eql([{ start: 1, end: 1 }]);
  });

  it("multiple headings and paragraphs content should work", async function() {
    const content = `# test

test

# test

test`;

    const ast = await unified()
      .use(remarkParse)
      .parse(content);

    const blocks = getBlocks(ast);

    expect(blocks).to.be.eql([
      { start: 1, end: 3 },
      { start: 5, end: 7 },
    ]);
  });
});
