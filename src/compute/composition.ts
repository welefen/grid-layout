import { Container } from '../container';
import { GridCompute } from './grid';
import { TrackList, GridCell, BoundingRect } from '../util/config';
import { Node } from '../node';
import { TrackCompute } from './track';

export class Composition {
  container: Container;
  rowTrack: TrackList;
  columnTrack: TrackList;
  cells: GridCell[][];
  constructor(container: Container) {
    this.container = container;
    const grid = new GridCompute(this.container);
    const gridTemplateAreas = this.container.config.gridTemplateAreas;
    if (gridTemplateAreas && gridTemplateAreas.length) {
      grid.setAreas(<string[][]>gridTemplateAreas);
    }
    const nodes = this.container.children;
    grid.putNodes(nodes);
    this.cells = grid.cells;
    this.rowTrack = grid.rowTrack;
    this.columnTrack = grid.columnTrack;
  }
  parseCellSize() {
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
      node.cells.forEach(cell => {
        tops.push(cell.top);
        lefts.push(cell.left);
        rights.push(cell.left + cell.width);
        bottoms.push(cell.top + cell.height);
      })
      const boundingRect: BoundingRect = { top: Math.min(...tops), left: Math.min(...lefts) };
      boundingRect.width = Math.max(...rights) - boundingRect.left;
      boundingRect.height = Math.max(...bottoms) - boundingRect.top;
      node.parsePosition(boundingRect);
    })
  }
  compose() {
    const rowInstance = new TrackCompute(this.rowTrack, this.cells, this.container, 'row');
    rowInstance.parse();
    const columnInstane = new TrackCompute(this.columnTrack, this.cells, this.container, 'column');
    columnInstane.parse();
    this.parseCellSize();
    this.parseNodeSize();
  }
}