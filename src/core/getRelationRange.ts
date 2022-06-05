export const getRelationRange = (linesRelationMap, range) => {
  let start;
  let end;

  for (const a of Array.from(linesRelationMap.entries())) {
    const [oldRange, newRange] = a as any;
    if (oldRange[0] <= range[0] && oldRange[1] >= range[0]) {
      if (start !== undefined) {
        continue;
      }

      if (newRange[2]?.dirty === false) {
        start = newRange[0] + (range[0] - oldRange[0]);
      } else {
        start = newRange[0];
      }
    }

    if (oldRange[0] <= range[1] && oldRange[1] >= range[1]) {
      if (end !== undefined) {
        break;
      }

      if (newRange[2]?.dirty === false) {
        end = newRange[1] - (oldRange[1] - range[1]);
        break;
      }

      if (newRange[1] === null) {
        if (newRange[0] === 1) {
          end = 1;
          break;
        }

        end = newRange[0] - 1;
        break;
      }

      end = newRange[1];
      break;
    }
  }

  return [start, end];
};
