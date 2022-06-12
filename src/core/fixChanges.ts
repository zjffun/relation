export const fixChanges = (changes) => {
  let last = changes.at(-1);
  if (last.value.endsWith("\n")) {
    last.count++;
  }
  return changes;
};
