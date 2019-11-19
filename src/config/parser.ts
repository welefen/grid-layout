import {TrackListTokenizer} from './tokenizer';

class Parser {
  tokens: string[];
  text: string;
  index: number = 0;
  length: number;
  constructor(text: string) {
    this.text = text;
  }
  nextNeed(token: string) {
    if(this.peek() !== token) {
      throw new Error(`next token must be ${token}`);
    }
  }
  peek() {
    return this.tokens[this.index++];
  }
}

type conditionChecker = (val: string) => boolean;
interface parsedValue {
  value: number | string;
  unit: string
}

export class TrackListParser extends Parser {
  parse() {
    const instance = new TrackListTokenizer(this.text);
    this.tokens = instance.getTokens();
    this.length = this.tokens.length;
    return this.parseCondition(_ => true, ['minmax', 'fit-content', 'repeat']);
  }
  parseValue(value: string): parsedValue {
    if(value === 'auto' || value === 'min-content' || value === 'max-content') {
      return {value: value, unit: ''};
    }
    const lenReg = /^(\d+(?:\.\d+)?)+(px|fr|%)?$/;
    const match = value.match(lenReg);
    if (match) {
      const val = parseFloat(match[1]);
      if(!match[2] || match[2] === 'px') {
        return {value: val, unit: ''};
      }
      if(match[2] === '%') {
        return {value: val, unit: '%'};
      }
      if (match[2] === 'fr') {
        return {value: val, unit: 'fr'};
      }
    }
    throw new Error(`${value} is not allowed`);
  }
  isFixedBreadth(value: parsedValue): boolean {
    return !value.unit || value.unit === '%';
  }
  isInflexibleBreadth(value: parsedValue): boolean {
    return this.isFixedBreadth(value) || ['min-content', 'max-content', 'auto'].includes(<string>value.value);
  }
  isTrackBreadth(value: parsedValue): boolean {
    return this.isInflexibleBreadth(value) || value.unit === 'fr';
  }
  // fit-content(<lenth-percentage>)
  parseFitContent() {
    this.nextNeed('(');
    const value = this.peek();
    this.nextNeed(')');
    const val = this.parseValue(value);
    if(!this.isFixedBreadth(val)) {
      throw new Error(`${value} is not allowed in fit-content`);
    }
    return {type: 'fit-content', args: [val]};
  }
  // minmax(min, max)
  private parseMinMax() {
    this.nextNeed('(');
    const minValue = this.peek();
    const min = this.parseValue(minValue);
    this.nextNeed(',');
    const maxValue = this.peek();
    const max = this.parseValue(maxValue);
    this.nextNeed(')');
    if(this.isInflexibleBreadth(min) && this.isTrackBreadth(max) || 
    this.isFixedBreadth(min) && this.isTrackBreadth(max) || 
    this.isInflexibleBreadth(min) && this.isFixedBreadth(max)) {
      return {type: 'minmax', args: [min, max]};
    }
    throw new Error(`minmax(${min.value}${min.unit}, ${max.value}${max.unit}) is not allowd`);
  }
  // [linename1 linename2]
  parseLineNames(): string[] {
    const lineNames: string[] = [];
    let isEnd = false;
    while(this.index < this.length) {
      const item = this.peek();
      if(item === ']') {
        isEnd = true;
        break;
      } else {
        lineNames.push(item);
      }
    }
    if(!isEnd) {
      throw new Error(`parse line names error`);
    }
    return lineNames;
  }
  parseRepeatNum(val: string): number | 'auto-fill' | 'auto-fit' {
    if(val === 'auto-fill' || val === 'auto-fit') return val;
    if(/^\d+$/.test(val)) return parseInt(val, 10);
    throw new Error(`${val} is not allowed`);
  }
  parseRepeat() {
    this.nextNeed('(');
    const repeatNum = this.parseRepeatNum(this.peek());
    this.nextNeed(',');
    let isEnd = false;
    const result = this.parseCondition(str => {
      const flag = (str !== ')');
      if(!flag) {
        isEnd = true;
      }
      return flag;
    }, ['minmax', 'fit-content']);
    if(!isEnd) {
      throw new Error('can not find ) in repeat syntax');
    }
    return {
      type: 'repeat',
      args: [repeatNum, result]
    }
  }
  parseCondition(checkFn: conditionChecker, supports: string[]) {
    const lines: any[] = [];
    let lineNames: string[] = [];
    while(this.index < this.length) {
      const item = this.peek();
      if(!checkFn(item)) break;
      let value: any;
      if(item === '[') {
        lineNames = this.parseLineNames();
        continue;
      }
      if(item === 'minmax' && supports.indexOf('minmax') > -1) {
        value = this.parseMinMax();
      } else if(item === 'fit-content' && supports.indexOf('fit-content') > -1) {
        value = this.parseFitContent();
      } else if(item === 'repeat' && supports.indexOf('repeat') > -1) {
        value = this.parseRepeat();
      } else {
        value = this.parseValue(item);
      }
      value.lineNames = lineNames;
      lineNames = [];
      lines.push(value);
    }
    return {lines, lineNames};
  }
}