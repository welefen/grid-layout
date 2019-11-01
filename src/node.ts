import {Config} from './config';

let id = 1;
export default class Node {
  id: number = 0;
  parent: Node | null;
  children: Node[];
  config: Config;
  constructor(config: Config) {
    this.id = ++id;
    this.parent = null;
    this.children = [];
    this.config = config;
  }
  appendChild(node: Node): this {
    node.parent = this;
    this.children.push(node);
    return this;
  }

  // calculateLayout(width, height, direction) {
  //   if(width) this.width = width;
  //   if(height) this.height = height;
  //   if(direction) this.flexDirection = direction;
  //   const instance = new Compose(this);
  //   instance.compose();
  // }

  // getComputedLayout(props = []) {
  //   let width = this.computedWidth;
  //   if(width === undefined) {
  //     width = this.width;
  //   }
  //   let height = this.computedHeight;
  //   if(height === undefined) {
  //     height = this.height;
  //   }
  //   const layout = {left: this.left || 0, top: this.top || 0, width, height};
  //   props.forEach((item) => {
  //     layout[item] = this[item];
  //   });
  //   return layout;
  // }

  // getAllComputedLayout(props) {
  //   const layout = this.getComputedLayout();
  //   layout.children = this.children.sort((a, b) => {
  //     return a.id > b.id ? 1 : -1;
  //   }).map((item) => {
  //     return item.getComputedLayout(props);
  //   });
  //   return layout;
  // }
}