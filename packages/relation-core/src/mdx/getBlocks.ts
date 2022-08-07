import type { Root } from "mdast";

export interface IBlock {
  start?: number;
  end?: number;
}

export function getBlocks(ast: Root) {
  const children = ast.children;
  const blocks = [];

  if (!children.length) {
    return blocks;
  }

  let block: IBlock = {
    start: children[0].position.start.line,
  };

  let i;
  for (i = 1; i < children.length - 1; i++) {
    if (block.start === undefined) {
      block.start = children[i].position.start.line;
    }

    if (children[i + 1].type !== "heading") {
      continue;
    }

    block.end = children[i].position.end.line;
    blocks.push(block);
    block = {};
  }

  if (block.start === undefined) {
    block.start = children[i].position.end.line;
  }

  block.end = children[i].position.end.line;

  blocks.push(block);

  return blocks;
}
