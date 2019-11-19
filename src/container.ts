import Node from './node';
import {containerConfig} from './config/config';
import {TrackListParser} from './config/parser';
import Composition from './composition';

export default class Container {
  children: Node[];
  config:containerConfig;
  constructor(config: containerConfig) {
    this.config = config;
  }
  appendChild(node: Node){
    node.parent = this;
    this.children.push(node);
  }
  parseOrder(items: Node[]) {
    items.sort((a: Node, b: Node) => {
      const ar = a.config.order | 0;
      const br = b.config.order | 0;
      if(a.config.order && b.config.order) return ar > br ? 1 : -1;
      if(a.config.order) return ar > 0 ? 1 : -1;
      if(b.config.order) return br > 0 ? -1 : 1;
      return a.id > b.id ? 1 : -1;
    });
    return items;
  }
  parse(config?: containerConfig) {
    if(config) {
      Object.assign(this.config, config);
    }
    this.parseOrder(this.children);
    if(this.config.gridTemplateRows) {
      const instance = new TrackListParser(<string>this.config.gridTemplateRows);
      const data = instance.parse();
      this.config.gridTemplateRows = data;
    }
    if(this.config.gridTemplateColumns) {
      const instance = new TrackListParser(<string>this.config.gridTemplateColumns);
      const data = instance.parse();
      this.config.gridTemplateColumns = data;
    }
  }
  calculateLayout() {
    this.parse();
    this.children.forEach(item => {
      item.parse();
    })
    const instance = new Composition(this);
    instance.compose();
  }
}