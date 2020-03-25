import { NodeConfig, BorderProperty, BorderPaddingMarginProperty, GridLine, StringOrNumber, GridLineProperty, GridPlacement, BoundingRect, TrackType, GridCell } from './util/config';
import { Container } from './container';

let id = 1;
export class Node {
  id: number = 1;
  parent: Container | null;
  config: NodeConfig;
  minContentWidth: number;
  minContentHeight: number;
  maxContentWidth: number;
  maxContentHeight: number;
  boundingRect: BoundingRect = {};
  cells: GridCell[] = []; // node in cells
  placement: GridPlacement = { // node placement with grid-row-start/grid-column-start
    row: { start: -1, end: -1 },
    column: { start: -1, end: -1 }
  };
  constructor(config: NodeConfig = {}) {
    this.id = id++;
    this.config = Object.assign({}, config);
  }
  parse() {
    const keys = Object.keys(this.config);
    keys.forEach(item => {
      if (item.startsWith('border') || item.startsWith('padding') || item.startsWith('margin')) {
        this.parseCombineProperty(<BorderPaddingMarginProperty>item);
      }
      if (/^grid(?:Row|Column)(?:Start|End)$/.test(item)) {
        this.parseGridLine(<GridLineProperty>item);
      }
    })
    this.parseSize();
    this.parseContentSize();
  }
  private parseGridLine(property: GridLineProperty): void {
    const value = <StringOrNumber>this.config[property];
    if (!value || value === 'auto') {
      this.config[property] = {};
    } else if (typeof value === 'number') {
      this.config[property] = { integer: value }
    } else {
      const arr = (<string>value).split(/\s+/g).filter(item => item);
      const desc: GridLine = {};
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
  private parsePercentValue(value: string): false | number {
    if (!/%$/.test(value)) return false;
    return 0.01 * parseFloat(value);
  }
  private parseMarginAuto(value: string | number, autoValue = 0) {
    if (value === 'auto') return autoValue;
    return value || 0;
  }
  private parseCombineValue<T>(value: T | T[]) {
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
  private parseNumberValue(value: string | number, parentValue?: number): string | number {
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
  private parseCombineProperty(property: BorderPaddingMarginProperty) {
    const pWidth = <number>this.parent.config.width;
    if (property === 'border' || property === 'padding' || property === 'margin') {
      const values = <number[]>this.parseCombineValue(property).map(item => this.parseNumberValue(item, pWidth));
      const props = [`${property}Top`, `${property}Right`, `${property}Bottom`, `${property}Left`];
      props.forEach((item: BorderPaddingMarginProperty, index) => {
        this.config[item] = values[index];
      })
    } else {
      this.config[property] = this.parseNumberValue(this.config[property], pWidth);
    }
  }
  private parseSize() {
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
  private parseLayoutWidth(width: number): number {
    const marginLeft = <number>this.parseMarginAuto(this.config.marginLeft);
    const marginRight = <number>this.parseMarginAuto(this.config.marginRight);
    width += marginLeft + marginRight;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'];
      props.forEach((item: BorderProperty) => {
        width += this.config[item] || 0;
      });
    }
    return width;
  }
  private parseLayoutHeight(height: number): number {
    const marginTop = <number>this.parseMarginAuto(this.config.marginTop);
    const marginBottom = <number>this.parseMarginAuto(this.config.marginBottom);
    height += marginTop + marginBottom;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'];
      props.forEach((item: BorderProperty) => {
        height += this.config[item] || 0;
      });
    }
    return height;
  }
  private parseMinMaxValue(value: number, min: number, max: number) {
    if (min && value < min) {
      value = min;
    }
    if (max && value > max) {
      value = max;
    }
    return value;
  }
  private parseComputedWidth(owidth?: number): number {
    let width = <number>this.config.width || owidth || 0;
    const minWidth = <number>this.config.minWidth;
    let maxWidth = <number>this.config.maxWidth;
    return this.parseMinMaxValue(width, minWidth, maxWidth);
  }
  private parseContentWidth(owidth: number): number {
    const width = this.parseComputedWidth(owidth);
    return this.parseLayoutWidth(width);
  }
  private parseComputedHeight(oheight?: number): number {
    let height = <number>this.config.height || oheight || 0;
    const minHeight = <number>this.config.minHeight;
    let maxHeight = <number>this.config.maxHeight;
    return this.parseMinMaxValue(height, minHeight, maxHeight);
  }
  private parseContentHeight(oheight: number): number {
    const height = this.parseComputedHeight(oheight);
    return this.parseLayoutHeight(height);
  }
  private parseContentSize() {
    this.minContentWidth = this.parseContentWidth(this.config.minContentWidth);
    this.minContentHeight = this.parseContentHeight(this.config.minContentHeight);
    this.maxContentWidth = this.parseContentWidth(this.config.maxContentWidth);
    this.maxContentHeight = this.parseContentHeight(this.config.maxContentHeight);
    this.boundingRect.width = this.parseComputedWidth(this.config.minContentWidth);
    this.boundingRect.height = this.parseComputedHeight(this.config.minContentHeight);
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
  private parseAutoMargin(type: TrackType, boundingRect: BoundingRect): boolean {
    const isRow = type === 'row';
    const marginStart = isRow ? this.config.marginTop : this.config.marginLeft;
    const marginEnd = isRow ? this.config.marginBottom : this.config.marginRight;
    const startAuto = marginStart === 'auto';
    const endAuto = marginEnd === 'auto';
    if (startAuto || endAuto) {
      const size = isRow ? (boundingRect.height - this.boundingRect.height) : (boundingRect.width - this.boundingRect.width);
      const prop = isRow ? 'top' : 'left';
      if (size > 0) {
        if (startAuto && endAuto) {
          this.boundingRect[prop] = boundingRect[prop] + size / 2;
        } else if (startAuto) {
          this.boundingRect[prop] = boundingRect[prop] + size;
        } else {
          this.boundingRect[prop] = boundingRect[prop];
        }
      } else {
        this.boundingRect[prop] = boundingRect[prop];
      }
      return true;
    }
    return false;
  }
  private parseAlign(align: string, type: TrackType, boundingRect: BoundingRect): void {
    const isRow = type === 'row';
    const prop = isRow ? 'top' : 'left';
    const sizeProp = isRow ? 'height' : 'width';
    const size = boundingRect[sizeProp] - this.boundingRect[sizeProp];
    switch (align) {
      case 'start':
        this.boundingRect[prop] = boundingRect[prop];
        break;
      case 'center':
        this.boundingRect[prop] = boundingRect[prop] + size / 2;
        break;
      case 'end':
        this.boundingRect[prop] = boundingRect[prop] + size;
        break;
      case 'stretch':
        if (!this.config[sizeProp]) {
          const min = <number>(isRow ? this.config.minHeight : this.config.minWidth);
          const max = <number>(isRow ? this.config.maxHeight : this.config.maxWidth);
          const value = this.parseMinMaxValue(size + this.boundingRect[sizeProp], min, max);
          if (value > this.boundingRect[sizeProp]) {
            this.boundingRect[sizeProp] = value;
          }
          this.boundingRect[prop] = boundingRect[prop];
        } else {
          this.boundingRect[prop] = boundingRect[prop];
        }
        break;
    }
  }
  parsePosition(boundingRect: BoundingRect) {
    if (!this.parseAutoMargin('row', boundingRect)) {
      let alignSelf = this.config.alignSelf;
      if (alignSelf === 'auto') {
        alignSelf = this.parent.config.alignItems;
      }
      this.parseAlign(alignSelf, 'row', boundingRect);
    }
    if (!this.parseAutoMargin('column', boundingRect)) {
      let justifySelf = this.config.justifySelf;
      if (justifySelf === 'auto') {
        justifySelf = this.parent.config.justifyItems;
      }
      this.parseAlign(justifySelf, 'column', boundingRect);
    }
  }
  getComputedLayout() {
    return this.boundingRect;
  }
}