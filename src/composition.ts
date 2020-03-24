import { Container } from './container';
import { GridCompute } from './compute/grid';
import { TrackList, GridCell, nodePos } from './config';
import { Node } from './node';
import { TrackSizeCompute } from './compute/trackSize';

export class Composition {
  container: Container;
  rowTrack: TrackList;
  columnTrack: TrackList;
  cells: GridCell[][];
  constructor(container: Container) {
    this.container = container;
    const grid = new GridCompute(this.container);
    const gridTemplateAreas = this.container.config.gridTemplateAreas;
    if (gridTemplateAreas) {
      grid.fromAreas(<string[][]>gridTemplateAreas);
    }
    const nodes = this.container.children;
    grid.fromNodes(nodes);
    this.cells = grid.cells;
    this.rowTrack = grid.rowTrack;
    this.columnTrack = grid.columnTrack;
  }
  parseCeilSize() {
    this.cells.forEach((lines: GridCell[], rowIndex: number) => {
      lines.forEach((item: GridCell, columnIndex: number) => {
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
        const cell = this.cells[pos.row][pos.column];
        tops.push(cell.top);
        lefts.push(cell.left);
        rights.push(cell.left + cell.width);
        bottoms.push(cell.top + cell.height);
      })
      const pos: nodePos = { top: Math.min(...tops), left: Math.min(...lefts) };
      pos.width = Math.max(...rights) - pos.left;
      pos.height = Math.max(...bottoms) - pos.top;
      node.parsePosition(pos);
    })
  }
  compose() {
    const rowInstance = new TrackSizeCompute(this.rowTrack, this.cells, this.container, 'row');
    rowInstance.parse();
    const columnInstane = new TrackSizeCompute(this.columnTrack, this.cells, this.container, 'column');
    columnInstane.parse();
    this.parseCeilSize();
    this.parseNodeSize();
  }
}