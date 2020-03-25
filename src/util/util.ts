
/**
 * parse space between items
 * @param {Number} space space size
 * @param {String} type start/end
 * @param {Number} num array size
 */
export function parseAlignSpace(space: number, type: string, num: number) {
  const marginSize = [];
  const fillFull = (size = 0) => {
    for (let i = marginSize.length; i < num + 1; i++) {
      marginSize[i] = size;
    }
  };
  if (space < 0) {
    if (type === 'space-between' || type === 'stretch') {
      type = 'start';
    } else if (type === 'space-around' || type === 'space-evenly') {
      type = 'center';
    }
  }
  if (type === 'end') {
    marginSize[0] = space;
    fillFull();
  } else if (type === 'center') {
    const itemSize = space / 2;
    marginSize[0] = itemSize;
    fillFull();
    marginSize[num] = itemSize;
  } else if (type === 'space-between') {
    marginSize[0] = 0;
    if (num === 1) {
      fillFull(space);
    } else {
      fillFull(space / (num - 1));
      marginSize[num] = 0;
    }
  } else if (type === 'space-around') {
    const itemSize = space / num;
    marginSize[0] = itemSize / 2;
    fillFull(itemSize);
    marginSize[num] = itemSize / 2;
  } else if (type === 'space-evenly') {
    const itemSize = space / (num + 1);
    fillFull(itemSize);
  } else if (type === 'stretch') {
    const itemSize = space / num;
    marginSize[0] = 0;
    fillFull(itemSize);
  } else {
    fillFull();
  }
  return marginSize;
}

export function parsePercentValue(value: string): false | number {
  if (!/%$/.test(value)) return false;
  return 0.01 * parseFloat(value);
}

export function parseMarginAuto(value: string | number, autoValue: number = 0) {
  if (value === 'auto') return autoValue;
  return value || 0;
}

export function parseNumberValue(value: string | number, parentValue?: number): string | number {
  if (value === 'auto' || typeof value === 'number') return value;
  if (!value) return 0;
  const percentValue = parsePercentValue(value);
  if (typeof percentValue === 'number') {
    value = percentValue * parentValue;
  } else if (/^[\d.-]+$/.test(value)) {
    value = parseFloat(value);
  } else {
    throw new Error(`${value} is not a number`);
  }
  return value;
}