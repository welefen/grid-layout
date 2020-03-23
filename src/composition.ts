import { Container } from './container';
import { GridCompute } from './compute/grid';
import { trackList, ceil } from './config';
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
  compose() {
    const rowInstance = new TrackSizeCompute(this.rowTrack, this.ceils, this.container, 'row');
    rowInstance.parse();
    const columnInstane = new TrackSizeCompute(this.columnTrack, this.ceils, this.container, 'column');
    columnInstane.parse();
  }
}