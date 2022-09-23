import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { getBlocks } from "./getBlocks.js";

export async function getRelationRanges(fromContent, toContent) {
  const fromAst = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .parse(fromContent);
  const toAst = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .parse(toContent);

  const fromBlocks = getBlocks(fromAst);
  const toBlocks = getBlocks(toAst);

  const relations = [];

  for (let i = 0; i < toBlocks.length; i++) {
    const fromBlock = fromBlocks[i];
    const toBlock = toBlocks[i];
    if (!fromBlock) {
      break;
    }

    relations.push({
      fromRange: [fromBlock.start, fromBlock.end],
      toRange: [toBlock.start, toBlock.end],
    });
  }

  return relations;
}
