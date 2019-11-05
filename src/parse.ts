import {
  GridLineLength,
  GridLinePercentage,
  GridLineFlex,
  GridLineAuto,
  GridLineMinContent,
  GridLineMaxContent,
  GridLineFitContent,
  GridLineMinMax,
  GridLineRepeat,
  GridLineRepeatValue,
  GridLine
} from './gridLines';

const whitespace = ' \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';

const splitChars = '()[],/';

export class Tokenizer {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  isWhitespace(char: string): boolean {
    return whitespace.indexOf(char) > -1;
  }
  getTokens(): string[] {
    const tokens: string[] = [];
    const length: number = this.text.length;
    let token: string = '';
    let index: number = 0;
    while(index < length) {
      const char = this.text[index];
      const isWhitespace = this.isWhitespace(char);
      if (isWhitespace || splitChars.indexOf(char) > -1) {
        if (token) {
          tokens.push(token);
          token = '';
        }
        index++;
        if(!isWhitespace) {
          tokens.push(char);
        }
        continue;
      }
      token += char;
      index++;
    }
    if (token) {
      tokens.push(token);
    }
    return tokens;
  }
}

function isType(val: any, types: any[]) {
  return types.some(item => val instanceof item);
}
function isFixedBreadth(val: any): boolean {
  return isType(val, [GridLineLength, GridLinePercentage]);
}
function isInflexibleBreadth(val: any): boolean {
  return isFixedBreadth(val) || isType(val, [GridLineMinContent, GridLineMaxContent, GridLineAuto]);
}
function isTrackBreadth(val: any): boolean {
  return isInflexibleBreadth(val) || isType(val, [GridLineFlex]);
}
function parseRepeatNum(val: string): number | 'auto-fill' | 'auto-fit' {
  if(val === 'auto-fill' || val === 'auto-fit') return val;
  if(/^\d+$/.test(val)) return parseInt(val, 10);
  throw new Error(`${val} is not allowed`);
}

export class GridLineParser {
  tokens: string[];
  index: number;
  length: number;
  constructor(text: string) {
    this.tokens = new Tokenizer(text).getTokens();
    this.index = 0;
    this.length = this.tokens.length;
  }
  nextNeed(token: string) {
    if(this.peek() !== token) {
      throw new Error(`next token must be ${token}`);
    }
  }
  peek() {
    return this.tokens[this.index++];
  }
  parseValue(value: string) {
    if(value === 'auto') {
      return new GridLineAuto();
    }
    if (value === 'min-content') {
      return new GridLineMinContent();
    }
    if(value === 'max-content') {
      return new GridLineMaxContent();
    }
    const lenReg = /^(\d+(?:\.\d+)?)+(px|fr|%)?$/;
    const match = value.match(lenReg);
    if (match) {
      const val = parseFloat(match[1]);
      if(!match[2] || match[2] === 'px') {
        return new GridLineLength(val);
      }
      if(match[2] === '%') {
        return new GridLinePercentage(val);
      }
      if (match[2] === 'fr') {
        return new GridLineFlex(val);
      }
    }
    throw new Error(`${value} is not allowed`);
  }
  // fit-content(<lenth-percentage>)
  parseFitContent() {
    this.nextNeed('(');
    const value = this.peek();
    this.nextNeed(')');
    const val = this.parseValue(value);
    if(!isFixedBreadth(val)) {
      throw new Error(`${value} must be length or percentage`);
    }
    return new GridLineFitContent(val as (GridLineLength | GridLinePercentage));
  }
  // minmax()
  private parseMinMax(): GridLineMinMax {
    this.nextNeed('(');
    const minValue = this.peek();
    const min = this.parseValue(minValue);
    this.nextNeed(',');
    const maxValue = this.peek();
    const max = this.parseValue(maxValue);
    this.nextNeed(')');
    if((isInflexibleBreadth(min) && isTrackBreadth(max)) ||
      (isFixedBreadth(min) && isTrackBreadth(max)) || 
      (isInflexibleBreadth(min) && isFixedBreadth(max))
    ) {
      return new GridLineMinMax(min, max);
    }
    throw new Error(`error parameters ${minValue} and ${maxValue}`);
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
  parseRepeat(): GridLineRepeat {
    this.nextNeed('(');
    const repeatNum = parseRepeatNum(this.peek());
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
    const value = new GridLineRepeatValue(result.lines);
    value.lineNames = result.lineNames;
    const instance = new GridLineRepeat(repeatNum, value);
    return instance;
  }
  parseCondition(checkFn: (val: string) => boolean, supports: string[]) {
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
  parse() {
    const {lines, lineNames} = this.parseCondition(_ => true, ['minmax', 'fit-content', 'repeat']);
    const instance = new GridLine(lines);
    instance.lineNames = lineNames;
    return instance;
  }
}