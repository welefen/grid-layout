export const deepmerge = function (obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
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

export function parseMinMaxValue(value: number, min: number, max: number) {
  if (min && value < min) {
    value = min;
  }
  if (max && value > max) {
    value = max;
  }
  return value;
}

export function parseCombineValue<T>(value: T | T[]) {
  if (!Array.isArray(value)) {
    value = [value, value, value, value];
  } else if (value.length === 1) {
    value = [value[0], value[0], value[0], value[0]];
  } else if (value.length === 2) {
    value = [value[0], value[1], value[0], value[1]];
  } else if (value.length === 3) {
    value[3] = value[1];
  }
  return value;
}