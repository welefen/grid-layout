import { Node } from './node';
import { containerConfig, trackListType, autoFlow } from './config';
import { TrackParser } from './parser/track';
import { TrackCompute } from './compute/track';
import { AreaParser } from './parser/area';
import { Composition } from './composition';

export class Container {
  children: Node[] = [];
  config: containerConfig;
  constructor(config: containerConfig) {
    this.config = config;
  }
  public appendChild(node: Node) {
    node.parent = this;
    this.children.push(node);
    return this;
  }
  private parseOrder(items: Node[]) {
    items.sort((a: Node, b: Node) => {
      const ar = a.config.order | 0;
      const br = b.config.order | 0;
      if (a.config.order && b.config.order) return ar > br ? 1 : -1;
      if (a.config.order) return ar > 0 ? 1 : -1;
      if (b.config.order) return br > 0 ? -1 : 1;
      return a.id > b.id ? 1 : -1;
    });
    return items;
  }
  private parse(config?: containerConfig) {
    if (config) {
      Object.assign(this.config, config);
    }
    this.parseOrder(this.children);
    ['gridTemplateRows', 'gridTemplateColumns', 'gridAutoRows', 'gridAutoColumns'].forEach(item => {
      const instance = new TrackParser(<string>this.config[<trackListType>item]);
      const type = item.includes('Rows') ? 'row' : 'column';
      const compute = new TrackCompute(instance.parse(), this, type);
      this.config[<trackListType>item] = compute.trackList;
    });
    // parse grid-auto-flow
    if (this.config.gridAutoFlow) {
      const gridAutoFlow = <string>this.config.gridAutoFlow;
      const autoFlow: autoFlow = {};
      if (gridAutoFlow.indexOf('column') > -1) {
        autoFlow.column = true;
      } else {
        autoFlow.row = true;
      }
      if (gridAutoFlow.indexOf('dense') > -1) {
        autoFlow.dense = true;
      }
      this.config.gridAutoFlow = autoFlow;
    }
    if (this.config.gridTemplateAreas) {
      const instance = new AreaParser(<string>this.config.gridTemplateAreas);
      const areas = instance.parse();
      this.config.gridTemplateAreas = areas;
    }
    if (typeof this.config.gridRowGap === 'string') {
      this.config.gridRowGap = parseFloat(this.config.gridRowGap) || 0;
    }
    if (typeof this.config.gridColumnGap === 'string') {
      this.config.gridColumnGap = parseFloat(this.config.gridColumnGap) || 0;
    }
  }
  public calculateLayout() {
    this.parse();
    this.children.forEach(item => {
      item.parse();
    })
    const instance = new Composition(this);
    instance.compose();
  }
  public getAllComputedLayout() {

  }
}