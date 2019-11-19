import {nodeConfig, borderType, paddingType, marginType, combineType} from './config/config';
import Container from './container';

let id = 1;
export default class Node {
  id: number = 1;
  parent: Container | null;
  config: nodeConfig;
  offsetWidth: number;
  offsetHeight: number;
  computedWidth: number;
  computedHeight: number;
  layoutWidth: number;
  layoutHeight: number;
  constructor(config: nodeConfig = {}) {
    this.id = ++id;
    this.config = config;
  }
  parse(config?: nodeConfig){
    if(config) {
      Object.assign(this.config, config);
    }
    const keys = Object.keys(this.config);
    keys.forEach(item => {
      if(item.startsWith('border') || item.startsWith('padding') || item.startsWith('margin')) {
        this.parseCombineProperty(<combineType>item);
      }
    })
    this.parseSize();
    this.parseComputedWidth();
    this.parseComputedHeight();
    this.parseLayoutWidth();
    this.parseLayoutHeight();
  }
  parsePercentValue(value: string) : false | number {
    if(!/%$/.test(value)) return false;
    return 0.01 * parseFloat(value);
  }
  parseMarginAuto(value: string | number, autoValue = 0) {
    if(value === 'auto') return autoValue;
    return value || 0;
  }
  parseCombineValue<T>(value: T | T[]) {
    if(!Array.isArray(value)) {
      value = [value, value, value, value];
    } else if(value.length === 1) {
      value = [value[0], value[0], value[0], value[0]];
    } else if(value.length === 2) {
      value = [value[0], value[1], value[0], value[1]];
    } else if(value.length === 3) {
      value[3] = value[1];
    }
    return value;
  }
  parseNumberValue(value: string | number, parentValue?: number): string | number {
    if(value === 'auto' || typeof value === 'number') return value;
    if(!value) return 0;
    const percentValue = this.parsePercentValue(value);
    if(typeof percentValue === 'number') {
      value = percentValue * parentValue;
    } else if(/^[\d.-]+$/.test(value)) {
      value = parseFloat(value);
    } else {
      throw new Error(`${value} is not a number`);
    }
    return value;
  }
  parseCombineProperty(property: combineType) {
    const pWidth = <number>this.parent.config.width;
    if (property === 'border' || property === 'padding' || property === 'margin') {
      const values =  <number[]>this.parseCombineValue(property).map(item => this.parseNumberValue(item, pWidth));
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

    if(this.config.width && !this.offsetWidth) {
      this.offsetWidth = <number>this.config.width;
    }
    const pHeight = this.parent.config.height;
    this.config.height = this.parseNumberValue(this.config.height, pHeight);
    this.config.minHeight = this.parseNumberValue(this.config.minHeight, pHeight);
    this.config.maxHeight = this.parseNumberValue(this.config.maxHeight, pHeight);

    if(this.config.width && !this.offsetWidth) {
      this.offsetHeight = <number>this.config.height;
    }
  }
  parseComputedWidth() {
    let width = this.config.width;
    if(width === undefined) {
      width = this.offsetWidth || 0;
    }
    const minWidth = this.config.minWidth;
    let maxWidth = this.config.maxWidth;
    if(maxWidth && minWidth && maxWidth < minWidth) {
      maxWidth = minWidth;
    }
    if(minWidth && width < minWidth) {
      width = minWidth;
    }
    if(maxWidth && width > maxWidth) {
      width = maxWidth;
    }
    this.computedWidth = <number>width;
  }
  parseComputedHeight() {
    let height = this.config.width;
    if(height === undefined) {
      height = this.offsetHeight || 0;
    }
    const minHeight = this.config.minHeight;
    let maxHeight = this.config.maxHeight;
    if(maxHeight && minHeight && maxHeight < minHeight) {
      maxHeight = minHeight;
    }
    if(minHeight && height < minHeight) {
      height = minHeight;
    }
    if(maxHeight && height > maxHeight) {
      height = maxHeight;
    }
    this.computedHeight = <number>height;
  }
  parseLayoutWidth() {
    let width = this.computedWidth;

    const marginLeft = <number>this.parseMarginAuto(this.config.marginLeft);
    const marginRight = <number>this.parseMarginAuto(this.config.marginRight);
    width += marginLeft + marginRight;
    if(this.config.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'];
      props.forEach((item: borderType) => {
        width += this.config[item] || 0;
      });
    }
    this.layoutWidth = width;
  }
  parseLayoutHeight() {
    let height = this.computedHeight;

    const marginTop = <number>this.parseMarginAuto(this.config.marginTop);
    const marginBottom = <number>this.parseMarginAuto(this.config.marginBottom);
    height += marginTop + marginBottom;
    if(this.config.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'];
      props.forEach((item: borderType) => {
        height += this.config[item] || 0;
      });
    }
    this.layoutHeight = height;
  }
}