import { Node } from './node';
import { ContainerConfig, TrackSizeProperty, GridAutoFlow, AlignmentProperty, ContainerBoundingRect } from './util/config';
import { TrackParser } from './parser/track';
import { RepeatTrackCompute } from './compute/repeatTrack';
import { AreaParser } from './parser/area';
import { Composition } from './compute/composition';

export class Container {
  children: Node[] = [];
  config: ContainerConfig;
  constructor(config: ContainerConfig) {
    this.config = Object.assign({}, config);
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
  private parse() {
    this.parseOrder(this.children);
    ['gridTemplateRows', 'gridTemplateColumns', 'gridAutoRows', 'gridAutoColumns'].forEach(item => {
      const parser = new TrackParser(<string>this.config[<TrackSizeProperty>item]);
      parser.parse();
      const type = item.includes('Rows') ? 'row' : 'column';
      const compute = new RepeatTrackCompute(parser.trackList, this, type);
      compute.parse();
      this.config[<TrackSizeProperty>item] = compute.trackList;
    });
    // parse grid-auto-flow
    if (this.config.gridAutoFlow) {
      const gridAutoFlow = <string>this.config.gridAutoFlow;
      const autoFlow: GridAutoFlow = {};
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
    if (this.config.gridTemplateAreas && typeof this.config.gridTemplateAreas === 'string') {
      const instance = new AreaParser(<string>this.config.gridTemplateAreas);
      const areas = instance.parse();
      this.config.gridTemplateAreas = areas;
    }
    this.config.gridRowGap = parseFloat(<string>this.config.gridRowGap) || 0;
    if (this.config.gridRowGap < 0) {
      throw new Error('gridRowGap: negative values are invalid');
    }
    this.config.gridColumnGap = parseFloat(<string>this.config.gridColumnGap) || 0;
    if (this.config.gridColumnGap < 0) {
      throw new Error('gridColumnGap: negative values are invalid');
    }

    ['justifyContent', 'alignContent', 'alignItems', 'justifyItems'].forEach(item => {
      if (!this.config[<AlignmentProperty>item]) {
        this.config[<AlignmentProperty>item] = 'stretch';
      }
    })
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
    // restore children order
    this.children.sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    })
    const layout: ContainerBoundingRect = { top: 0, left: 0, width: this.config.width, height: this.config.height };
    layout.children = this.children.map(item => {
      return item.getComputedLayout();
    });
    return layout;
  }
}