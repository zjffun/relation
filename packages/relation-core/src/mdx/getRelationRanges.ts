import { getBlocks } from "./getBlocks.js";

interface IRelation {
  fromRange: [number, number];
  toRange: [number, number];
}

export async function getRelationRanges(
  fromContent: string,
  toContent: string
): Promise<IRelation[]> {
  const { default: remarkFrontmatter } = await import("remark-frontmatter");
  const { default: remarkParse } = await import("remark-parse");
  const { unified } = await import("unified");

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

  const relations: IRelation[] = [];

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
