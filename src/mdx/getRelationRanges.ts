import { unified } from "unified";
import remarkParse from "remark-parse";
import { getBlocks } from "./getBlocks.js";

export async function getRelationRanges(srcContent, content) {
  const srcAst = await unified().use(remarkParse).parse(srcContent);
  const ast = await unified().use(remarkParse).parse(content);

  const srcBlocks = getBlocks(srcAst);
  const blocks = getBlocks(ast);

  const relations = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const srcBlock = srcBlocks[i];
    if (!srcBlock) {
      break;
    }

    relations.push({
      range: [block.start, block.end],
      srcRange: [srcBlock.start, srcBlock.end],
    });
  }

  return relations;
}
