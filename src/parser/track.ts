import { Parser } from './base';
import { TrackItem, TrackList } from '../util/config';
import { TrackTokenizer } from '../tokenizer/track';
import { isFixedBreadth, isInflexibleBreadth, isTrackBreadth } from '../util/track';

type conditionChecker = (val: string) => boolean;

export class TrackParser extends Parser {
  trackList: TrackList;
  /**
   * parse track list
   */
  parse() {
    const instance = new TrackTokenizer(this.text);
    this.tokens = instance.getTokens();
    this.length = this.tokens.length;
    const result = this.parseCondition(_ => true, ['minmax', 'fit-content', 'repeat']);
    this.checkTrack(result);
    this.trackList = result;
  }
  parseValue(value: string): TrackItem {
    if (value === 'auto' || value === 'min-content' || value === 'max-content') {
      return { type: value, baseSize: 0, growthLimit: Infinity };
    }
    const lenReg = /^(\d+(?:\.\d+)?)+(px|fr|%)?$/;
    const match = value.match(lenReg);
    if (match) {
      const val = parseFloat(match[1]);
      if (val < 0) {
        throw new Error(`${value} must be positive`);
      }
      if (!match[2] || match[2] === 'px') {
        return { value: val, type: 'px', baseSize: val, growthLimit: val };
      }
      if (match[2] === '%') {
        return { value: val, type: '%' };
      }
      if (match[2] === 'fr') {
        return { value: val, type: 'fr', baseSize: 0, growthLimit: 0 };
      }
    }
    throw new Error(`${value} is not allowed`);
  }
  // fit-content(<lenth-percentage>)
  parseFitContent(): TrackItem {
    this.nextNeed('(');
    const value = this.peek();
    this.nextNeed(')');
    const val = this.parseValue(value);
    if (!isFixedBreadth(val)) {
      throw new Error(`${value} is not allowed in fit-content`);
    }
    return { type: 'fit-content', args: [val], baseSize: 0, growthLimit: Infinity };
  }
  // minmax(min, max)
  private parseMinMax(): TrackItem {
    this.nextNeed('(');
    const minValue = this.peek();
    const min = this.parseValue(minValue);
    this.nextNeed(',');
    const maxValue = this.peek();
    const max = this.parseValue(maxValue);
    this.nextNeed(')');
    if (isInflexibleBreadth(min) && isTrackBreadth(max) ||
      isFixedBreadth(min) && isTrackBreadth(max) ||
      isInflexibleBreadth(min) && isFixedBreadth(max)) {
      return { type: 'minmax', args: [min, max], baseSize: 0, growthLimit: Infinity };
    }
    throw new Error(`minmax(${min.value}${min.type}, ${max.value}${max.type}) is not allowd`);
  }
  // [linename1 linename2]
  parseLineNames(): string[] {
    const lineNames: string[] = [];
    let isEnd = false;
    while (this.index < this.length) {
      const item = this.peek();
      if (item === ']') {
        isEnd = true;
        break;
      } else {
        lineNames.push(item);
      }
    }
    if (!isEnd) {
      throw new Error(`parse line names error`);
    }
    return lineNames;
  }
  /**
   * parse repealt num in repeat(xxx, yyyy)
   * @param val 
   */
  parseRepeatNum(val: string): number | 'auto-fill' | 'auto-fit' {
    if (val === 'auto-fill' || val === 'auto-fit') return val;
    if (/^\d+$/.test(val)) {
      const result = parseInt(val, 10);
      if (result <= 0) {
        throw new Error(`${val} is not allowd in repeat`);
      }
      return result;
    }
    throw new Error(`${val} is not allowed`);
  }
  /**
   * parse repeat track
   */
  parseRepeat(): TrackItem {
    this.nextNeed('(');
    const repeatNum = this.parseRepeatNum(this.peek());
    this.nextNeed(',');
    let isEnd = false;
    const result = this.parseCondition(str => {
      const flag = (str !== ')');
      if (!flag) {
        isEnd = true;
      }
      return flag;
    }, ['minmax', 'fit-content']);
    if (!isEnd) {
      throw new Error('can not find ) in repeat syntax');
    }
    let type = 'fix-repeat';
    if (repeatNum === 'auto-fill') {
      type = 'auto-fill-repeat';
    } else if (repeatNum === 'auto-fit') {
      type = 'auto-fit-repeat';
    }
    return {
      type: type,
      args: [repeatNum, result]
    }
  }
  parseCondition(checkFn: conditionChecker, supports: string[]): TrackList {
    const tracks: TrackList = [];
    let lineNames: string[] = [];
    while (this.index < this.length) {
      const item = this.peek();
      if (!checkFn(item)) break;
      let value: TrackItem;
      if (item === '[') {
        lineNames = this.parseLineNames();
        continue;
      }
      if (item === 'minmax' && supports.includes('minmax')) {
        value = this.parseMinMax();
      } else if (item === 'fit-content' && supports.includes('fit-content')) {
        value = this.parseFitContent();
      } else if (item === 'repeat' && supports.includes('repeat')) {
        value = this.parseRepeat();
      } else {
        value = this.parseValue(item);
      }
      value.lineNamesStart = lineNames;
      value.lineNamesEnd = [];
      if (tracks.length) {
        tracks[tracks.length - 1].lineNamesEnd = lineNames.slice();
      }
      lineNames = [];
      tracks.push(value);
    }
    if (lineNames.length) {
      tracks[tracks.length - 1].lineNamesEnd = lineNames;
    }
    return tracks;
  }
  checkAutoRepeatTrack(list: TrackList) {
    list.forEach(item => {
      const type = item.type;
      if (type === 'px' || type === '%') return;
      if (type === 'minmax') {
        const arg0 = <TrackItem>item.args[0];
        const arg1 = <TrackItem>item.args[1];
        if (isFixedBreadth(arg0) && isTrackBreadth(arg1)) return;
        if (isInflexibleBreadth(arg0) && isFixedBreadth(arg1)) return;
      }
      throw new Error(`${item.type} not allowed in auto-repeat`);
    })
  }
  checkTrack(trackList: TrackList) {
    let autoRepeat = 0;
    let intrinsic = 0;
    let flexible = 0;
    trackList.forEach(item => {
      switch (item.type) {
        case 'auto-fit-repeat':
        case 'auto-fill-repeat':
          autoRepeat++;
          this.checkAutoRepeatTrack(<TrackList>item.args[1]);
          break;
        case 'auto':
        case 'fit-content':
        case 'min-content':
        case 'max-content':
          intrinsic++;
          break;
        case 'fr':
          flexible += item.value;
          break;
      }
    })
    if (autoRepeat > 1 || (autoRepeat && (intrinsic || flexible))) {
      throw new Error('auto-repeat can not be combined with intrinsic or flexible sizes');
    }
  }
}