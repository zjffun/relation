import Relation from "../core/Relation.js";
import { getRelationRanges } from "./getRelationRanges.js";

export default async function(options: {
  workingDirectory: string;
  fromAbsolutePath: string;
  toAbsolutePath: string;
}) {
  const baseRelation = new Relation({
    workingDirectory: options.workingDirectory,
  });

  baseRelation.fromAbsolutePath = options.fromAbsolutePath;
  baseRelation.toAbsolutePath = options.toAbsolutePath;

  const fromContent = baseRelation.fromCurrentContent;
  const toContent = baseRelation.toCurrentContent;

  const relationRanges = await getRelationRanges(fromContent, toContent);

  const relations: Relation[] = [];

  for (const relationRange of relationRanges) {
    const relation = new Relation({
      workingDirectory: options.workingDirectory,
      fromPath: baseRelation.fromPath,
      toPath: baseRelation.toPath,
      fromRange: relationRange.fromRange,
      toRange: relationRange.toRange,
    });

    await relation.autoSetFromRev();

    await relation.autoSetToRev();

    relations.push(relation);
  }

  return relations;
}
