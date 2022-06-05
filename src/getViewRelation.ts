export function getViewRelation(linesRelation) {
  const links = [];
  linesRelation.oldLines.forEach((line, i) => {
    const nline = linesRelation.linesRelationMap.get(line);

    if (nline !== null) {
      links.push([line, nline]);
    }
  });

  linesRelation.newLines.forEach((line, i) => {
    const oline = linesRelation.linesRelationMap.get(line);

    if (oline !== null) {
      if (!Array.isArray(oline)) {
        links.push([oline, line]);
      }
    }
  });

  return links;
}
