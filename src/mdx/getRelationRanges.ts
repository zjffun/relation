import { unified } from "unified";
import remarkParse from "remark-parse";
import { getBlocks } from "./getBlocks.js";

export async function getRelationRanges(fromContent, toContent) {
  const fromAst = await unified().use(remarkParse).parse(fromContent);
  const toAst = await unified().use(remarkParse).parse(toContent);

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
