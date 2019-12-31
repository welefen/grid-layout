import { nodeConfig, borderType, paddingType, marginType, combineType, position, gridLine, stringOrNumber, gridLineType } from './config';
import { Container } from './container';

let id = 1;
export class Node {
  id: number = 1;
  parent: Container | null;
  config: nodeConfig;
  minContentWidth: number;
  minContentHeight: number;
  maxContentWidth: number;
  maxContentHeight: number;
  gridPos: position[];
  constructor(config: nodeConfig = {}) {
    this.id = ++id;
    this.config = config;
    this.gridPos = [];
  }
  parse(config?: nodeConfig) {
    if (config) {
      Object.assign(this.config, config);
    }
    const keys = Object.keys(this.config);
    keys.forEach(item => {
      if (item.startsWith('border') || item.startsWith('padding') || item.startsWith('margin')) {
        this.parseCombineProperty(<combineType>item);
      }
      if (/^grid(?:Row|Column)(?:Start|End)$/.test(item)) {
        this.parseGridLine(<gridLineType>item);
      }
    })
    if (!this.config.gridColumnEnd && this.config.gridColumnStart && (<gridLine>this.config.gridColumnStart).customIndent) {
      this.config.gridColumnEnd = { customIndent: (<gridLine>this.config.gridColumnStart).customIndent };
    }
    if (!this.config.gridRowEnd && this.config.gridRowStart && (<gridLine>this.config.gridRowStart).customIndent) {
      this.config.gridRowEnd = { customIndent: (<gridLine>this.config.gridRowEnd).customIndent };
    }

    this.parseSize();
    this.parseContentSize();
  }
  parseGridLine(property: gridLineType): void {
    const value = <stringOrNumber>this.config[property];
    if (!value || value === 'auto') {
      this.config[property] = {};
    } else if (typeof value === 'number') {
      this.config[property] = { integer: value }
    } else {
      const arr = (<string>value).split(/\s+/g).filter(item => item);
      const desc: gridLine = {};
      arr.forEach(item => {
        if (item === 'span') {
          if (desc.span) {
            throw new Error(`${property}: ${value} is not valid`);
          }
          desc.span = true;
        } else if (/^\-?\d+$/.test(item)) {
          desc.integer = parseInt(item, 10);
        } else {
          desc.customIndent = item;
        }
      })
      this.config[property] = desc;
    }
  }
  parsePercentValue(value: string): false | number {
    if (!/%$/.test(value)) return false;
    return 0.01 * parseFloat(value);
  }
  parseMarginAuto(value: string | number, autoValue = 0) {
    if (value === 'auto') return autoValue;
    return value || 0;
  }
  parseCombineValue<T>(value: T | T[]) {
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
  parseNumberValue(value: string | number, parentValue?: number): string | number {
    if (value === 'auto' || typeof value === 'number') return value;
    if (!value) return 0;
    const percentValue = this.parsePercentValue(value);
    if (typeof percentValue === 'number') {
      value = percentValue * parentValue;
    } else if (/^[\d.-]+$/.test(value)) {
      value = parseFloat(value);
    } else {
      throw new Error(`${value} is not a number`);
    }
    return value;
  }
  parseCombineProperty(property: combineType) {
    const pWidth = <number>this.parent.config.width;
    if (property === 'border' || property === 'padding' || property === 'margin') {
      const values = <number[]>this.parseCombineValue(property).map(item => this.parseNumberValue(item, pWidth));
      const props = [`${property}Top`, `${property}Right`, `${property}Bottom`, `${property}Left`];
      props.forEach((item: combineType, index) => {
        this.config[item] = values[index];
      })
    } else {
      this.config[property] = this.parseNumberValue(this.config[property], pWidth);
    }
  }
  parseSize() {
    const pWidth = this.parent.config.width;
    this.config.width = this.parseNumberValue(this.config.width, pWidth);
    this.config.minWidth = this.parseNumberValue(this.config.minWidth, pWidth);
    this.config.maxWidth = this.parseNumberValue(this.config.maxWidth, pWidth);
    if (this.config.minWidth > this.config.maxWidth) {
      this.config.maxWidth = 0;
    }

    const pHeight = this.parent.config.height;
    this.config.height = this.parseNumberValue(this.config.height, pHeight);
    this.config.minHeight = this.parseNumberValue(this.config.minHeight, pHeight);
    this.config.maxHeight = this.parseNumberValue(this.config.maxHeight, pHeight);
    if (this.config.minHeight > this.config.maxHeight) {
      this.config.maxHeight = 0;
    }
  }
  parseLayoutWidth(width: number): number {
    const marginLeft = <number>this.parseMarginAuto(this.config.marginLeft);
    const marginRight = <number>this.parseMarginAuto(this.config.marginRight);
    width += marginLeft + marginRight;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'];
      props.forEach((item: borderType) => {
        width += this.config[item] || 0;
      });
    }
    return width;
  }
  parseLayoutHeight(height: number): number {
    const marginTop = <number>this.parseMarginAuto(this.config.marginTop);
    const marginBottom = <number>this.parseMarginAuto(this.config.marginBottom);
    height += marginTop + marginBottom;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'];
      props.forEach((item: borderType) => {
        height += this.config[item] || 0;
      });
    }
    return height;
  }
  parseMinMaxValue(value: number, min: number, max: number) {
    if (min && value < min) {
      value = min;
    }
    if (max && value > max) {
      value = max;
    }
    return value;
  }
  parseContentWidth(owidth: number): number {
    let width = <number>this.config.width || owidth;
    const minWidth = <number>this.config.minWidth;
    let maxWidth = <number>this.config.maxWidth;
    width = this.parseMinMaxValue(width, minWidth, maxWidth);
    return this.parseLayoutWidth(width);
  }
  parseContentHeight(oheight: number): number {
    let height = <number>this.config.height || oheight;
    const minHeight = <number>this.config.minHeight;
    let maxHeight = <number>this.config.maxHeight;
    height = this.parseMinMaxValue(height, minHeight, maxHeight);
    return this.parseLayoutHeight(height);
  }
  parseContentSize() {
    this.minContentWidth = this.parseContentWidth(this.config.minContentWidth);
    this.minContentHeight = this.parseContentHeight(this.config.minContentHeight);
    this.maxContentWidth = this.parseContentWidth(this.config.maxContentWidth);
    this.maxContentHeight = this.parseContentHeight(this.config.maxContentHeight);
  }
  getFitContentWidth(value: number): number {
    let width = <number>this.config.width;
    const minWidth = <number>this.config.minWidth;
    let maxWidth = <number>this.config.maxWidth;
    width = this.parseMinMaxValue(width, minWidth, maxWidth);
    if (width) {
      value = width;
    } else if (value > this.config.maxContentWidth) {
      value = this.config.maxContentWidth;
    } else if (this.config.minContentWidth > value) {
      value = this.config.minContentWidth;
    }
    return this.parseLayoutWidth(value);
  }
  getFitContentHeight(value: number): number {
    let height = <number>this.config.height;
    const minHeight = <number>this.config.minHeight;
    let maxHeight = <number>this.config.maxHeight;
    height = this.parseMinMaxValue(height, minHeight, maxHeight);
    if (height) {
      value = height;
    } else if (value > this.config.maxContentHeight) {
      value = this.config.maxContentHeight;
    } else if (this.config.minContentHeight > value) {
      value = this.config.minContentHeight;
    }
    return this.parseLayoutHeight(value);
  }
}