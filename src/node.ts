import { NodeConfig, BorderProperty, BorderPaddingMarginProperty, GridLine, StringOrNumber, GridLineProperty, GridPlacement, BoundingRect, TrackType, GridCell } from './util/config';
import { Container } from './container';
import { parseNumberValue, parseMarginAuto, parseMinMaxValue, parseCombineValue } from './util/util';

let id = 1;
export class Node {
  id: number = 1;
  parent: Container;
  config: NodeConfig;
  boundingRect: BoundingRect = {};
  cells: GridCell[] = []; // node in cells
  placement: GridPlacement = { // node placement with grid-row-start/grid-column-start
    row: { start: -1, end: -1, size: 1 },
    column: { start: -1, end: -1, size: 1 }
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
    });
    ['gridRowStart', 'gridRowEnd', 'gridColumnStart', 'gridColumnEnd'].forEach(item => {
      this.parseGridLine(<GridLineProperty>item);
    });
    this.parseSize();
    if (!this.config.alignSelf) {
      this.config.alignSelf = 'auto';
    }
    if (!this.config.justifySelf) {
      this.config.justifySelf = 'auto';
    }
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
          desc.customIdent = item;
        }
      })
      this.config[property] = desc;
    }
  }
  private parseCombineProperty(property: BorderPaddingMarginProperty) {
    const pWidth = <number>this.parent.config.width;
    if (property === 'border' || property === 'padding' || property === 'margin') {
      const values = <number[]>parseCombineValue(property).map(item => parseNumberValue(item, pWidth));
      const props = [`${property}Top`, `${property}Right`, `${property}Bottom`, `${property}Left`];
      props.forEach((item: BorderPaddingMarginProperty, index) => {
        this.config[item] = values[index];
      })
    } else {
      this.config[property] = parseNumberValue(this.config[property], pWidth);
    }
  }
  private parseSize() {
    const pWidth = this.parent.config.width;
    this.config.width = parseNumberValue(this.config.width, pWidth);
    this.config.minWidth = parseNumberValue(this.config.minWidth, pWidth);
    this.config.maxWidth = parseNumberValue(this.config.maxWidth, pWidth);
    if (this.config.minWidth > this.config.maxWidth) {
      this.config.maxWidth = 0;
    }

    const pHeight = this.parent.config.height;
    this.config.height = parseNumberValue(this.config.height, pHeight);
    this.config.minHeight = parseNumberValue(this.config.minHeight, pHeight);
    this.config.maxHeight = parseNumberValue(this.config.maxHeight, pHeight);
    if (this.config.minHeight > this.config.maxHeight) {
      this.config.maxHeight = 0;
    }
    this.config.minContentWidth = parseNumberValue(this.config.minContentWidth, pWidth);
    this.config.maxContentWidth = parseNumberValue(this.config.maxContentWidth, pWidth);
    this.config.minContentHeight = parseNumberValue(this.config.minContentHeight, pHeight);
    this.config.maxContentHeight = parseNumberValue(this.config.maxContentHeight, pHeight);

    this.boundingRect.width = this.getComputedWidth(<number>this.config.minContentWidth);
    this.boundingRect.height = this.getComputedHeight(<number>this.config.minContentHeight);
  }
  private getComputedWidth(width: number = 0): number {
    width = <number>this.config.width || width || 0;
    const minWidth = <number>this.config.minWidth;
    let maxWidth = <number>this.config.maxWidth;
    return parseMinMaxValue(width, minWidth, maxWidth);
  }

  private getLayoutWidth(width: number = 0): number {
    width = this.getComputedWidth(width);
    const marginLeft = <number>parseMarginAuto(this.config.marginLeft);
    const marginRight = <number>parseMarginAuto(this.config.marginRight);
    width += marginLeft + marginRight;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'];
      props.forEach((item: BorderProperty) => {
        width += this.config[item] || 0;
      });
    }
    return width;
  }
  private getComputedHeight(height: number = 0): number {
    height = <number>this.config.height || height || 0;
    const minHeight = <number>this.config.minHeight;
    let maxHeight = <number>this.config.maxHeight;
    return parseMinMaxValue(height, minHeight, maxHeight);
  }

  private getLayoutHeight(height: number = 0): number {
    height = this.getComputedHeight(height);
    const marginTop = <number>parseMarginAuto(this.config.marginTop);
    const marginBottom = <number>parseMarginAuto(this.config.marginBottom);
    height += marginTop + marginBottom;
    if (this.config.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'];
      props.forEach((item: BorderProperty) => {
        height += this.config[item] || 0;
      });
    }
    return height;
  }
  get minContentWidth() {
    return this.getLayoutWidth(<number>this.config.minContentWidth);
  }
  get maxContentWidth() {
    return this.getLayoutWidth(<number>this.config.maxContentWidth);
  }
  get minContentHeight() {
    return this.getLayoutHeight(<number>this.config.minContentHeight);
  }
  get maxContentHeight() {
    return this.getLayoutHeight(<number>this.config.maxContentHeight);
  }

  private parseAutoMargin(type: TrackType, boundingRect: BoundingRect): boolean {
    const isRow = type === 'row';
    const marginStart = isRow ? this.config.marginTop : this.config.marginLeft;
    const marginEnd = isRow ? this.config.marginBottom : this.config.marginRight;
    const startAuto = marginStart === 'auto';
    const endAuto = marginEnd === 'auto';
    if (startAuto || endAuto) {
      const cellSize = isRow ? boundingRect.height : boundingRect.width;
      const nodeSize = isRow ? this.getLayoutHeight() : this.getLayoutWidth();
      const size = Math.max(0, cellSize - nodeSize);
      const prop = isRow ? 'top' : 'left';
      if (startAuto && endAuto) {
        this.boundingRect[prop] = boundingRect[prop] + size / 2;
      } else if (startAuto) {
        this.boundingRect[prop] = boundingRect[prop] + size;
      } else {
        this.boundingRect[prop] = boundingRect[prop] + <number>parseMarginAuto(marginStart);
      }
      return true;
    }
    return false;
  }
  private parseAlign(align: string, type: TrackType, boundingRect: BoundingRect): void {
    const isRow = type === 'row';
    const prop = isRow ? 'top' : 'left';
    const sizeProp = isRow ? 'height' : 'width';
    const cellSize = isRow ? boundingRect.height : boundingRect.width;
    const nodeSize = isRow ? this.getLayoutHeight() : this.getLayoutWidth();
    const size = Math.max(0, cellSize - nodeSize);
    const marginStart = <number>parseMarginAuto(isRow ? this.config.marginTop : this.config.marginLeft);
    switch (align) {
      case 'start':
        this.boundingRect[prop] = boundingRect[prop] + marginStart;
        break;
      case 'center':
        this.boundingRect[prop] = boundingRect[prop] + size / 2 + marginStart;
        break;
      case 'end':
        this.boundingRect[prop] = boundingRect[prop] + size + marginStart;
        break;
      case 'stretch':
        if (!this.config[sizeProp]) {
          const min = <number>(isRow ? this.config.minHeight : this.config.minWidth);
          const max = <number>(isRow ? this.config.maxHeight : this.config.maxWidth);
          const marginEnd = <number>parseMarginAuto(isRow ? this.config.marginBottom : this.config.marginRight);
          const value = parseMinMaxValue(boundingRect[sizeProp] - marginStart - marginEnd, min, max);
          if (value > this.boundingRect[sizeProp]) {
            this.boundingRect[sizeProp] = value;
          }
        }
        this.boundingRect[prop] = boundingRect[prop] + marginStart;
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