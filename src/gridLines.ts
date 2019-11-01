type lineNames = string[];
type fixedBreadth = GridLineLength | GridLinePercentage;
type inflexibleBreadth = fixedBreadth | GridLineMinContent | GridLineMaxContent | GridLineAuto;
type trackBreadth = inflexibleBreadth | GridLineFlex;
type fixedSize = fixedBreadth | GridLineMinMax;
type trackSize = trackBreadth | GridLineMinMax | GridLineFitContent;
type repeatNums = number | 'auto-fill' | 'auto-fit';


class GridLineBase {
  lineNames: lineNames;
}

// 'auto'
export class GridLineAuto extends GridLineBase {
  
}

// 100px 100
export class GridLineLength  extends GridLineBase{
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

// 10%
export class GridLinePercentage extends GridLineBase {
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

// min-content
export class GridLineMinContent extends GridLineBase {

}

// max-content
export class GridLineMaxContent extends GridLineBase {
  
}

// 1fr
export class GridLineFlex extends GridLineBase {
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}



export class GridLineMinMax extends GridLineBase {
  min: fixedBreadth | inflexibleBreadth;
  max: trackBreadth | fixedBreadth;
  constructor(min: fixedBreadth | inflexibleBreadth, max: trackBreadth | fixedBreadth) {
    super();
    this.min = min;
    this.max = max;
  }
}

export class GridLineFitContent extends GridLineBase {
  value: fixedBreadth;
  constructor(value: fixedBreadth) {
    super();
    this.value = value;
  }
}

export class GridLineRepeatValue extends GridLineBase {
  value: trackSize[] | fixedSize[];
  constructor(value: trackSize[] | fixedSize[]) {
    super();
    this.value = value;
  }
}

export class GridLineRepeat extends GridLineBase {
  num: repeatNums;
  value: GridLineRepeatValue;
  constructor(num: repeatNums, value: GridLineRepeatValue) {
    super();
    this.num = num;
    this.value = value;
  }
}

export class GridLine<T> extends GridLineBase {
  lines: T[];
  constructor(lines: T[]) {
    super();
    this.lines = lines;
  }
}