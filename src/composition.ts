import { Container } from './container';
import { GridCompute } from './compute/grid';
import { trackList, ceil, nodePos } from './config';
import { Node } from './node';
import { TrackSizeCompute } from './compute/trackSize';

export class Composition {
  container: Container;
  rowTrack: trackList;
  columnTrack: trackList;
  ceils: ceil[][];
  constructor(container: Container) {
    this.container = container;
    const grid = new GridCompute(this.container);
    const gridTemplateAreas = this.container.config.gridTemplateAreas;
    if (gridTemplateAreas) {
      grid.fromAreas(<string[][]>gridTemplateAreas);
    }
    const nodes = this.container.children;
    grid.fromNodes(nodes);
    this.ceils = grid.ceils;
    this.rowTrack = grid.rowTrack;
    this.columnTrack = grid.columnTrack;
  }
  parseCeilSize() {
    this.ceils.forEach((lines: ceil[], rowIndex: number) => {
      lines.forEach((item: ceil, columnIndex: number) => {
        item.width = this.columnTrack[columnIndex].baseSize;
        item.height = this.rowTrack[rowIndex].baseSize;
        item.top = this.rowTrack[rowIndex].pos;
        item.left = this.columnTrack[columnIndex].pos;
      })
    })
  }
  parseNodeSize() {
    this.container.children.map((node: Node) => {
      const tops: number[] = [];
      const lefts: number[] = [];
      const bottoms: number[] = [];
      const rights: number[] = [];
      node.position.forEach(pos => {
        const ceil = this.ceils[pos.row][pos.column];
        tops.push(ceil.top);
        lefts.push(ceil.left);
        rights.push(ceil.left + ceil.width);
        bottoms.push(ceil.top + ceil.height);
      })
      const pos: nodePos = { top: Math.min(...tops), left: Math.min(...lefts) };
      pos.width = Math.max(...rights) - pos.left;
      pos.height = Math.max(...bottoms) - pos.top;
      node.parsePosition(pos);
    })
  }
  compose() {
    const rowInstance = new TrackSizeCompute(this.rowTrack, this.ceils, this.container, 'row');
    rowInstance.parse();
    const columnInstane = new TrackSizeCompute(this.columnTrack, this.ceils, this.container, 'column');
    columnInstane.parse();
    this.parseCeilSize();
    this.parseNodeSize();
  }
}