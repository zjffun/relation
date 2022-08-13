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

  let startLine;

  for (let i = 0; i < children.length - 1; i++) {
    if (startLine === undefined) {
      startLine = children[i].position.start.line;
    }

    if (children[i + 1].type !== "heading") {
      continue;
    }

    blocks.push({
      start: startLine,
      end: children[i].position.end.line,
    });
    startLine = undefined;
  }

  const lastChild = children.at(-1);

  if (startLine === undefined) {
    startLine = lastChild.position.start.line;
  }

  blocks.push({
    start: startLine,
    end: lastChild.position.end.line,
  });

  return blocks;
}
