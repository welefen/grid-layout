import { ceil, position, trackList } from '../config';
import { Node } from '../node';
import { Container } from '../container';

interface AreaNames {
  [key: string]: position[];
}

export class GridCompute {
  ceils: ceil[][];
  areaNames: AreaNames;
  container: Container;
  rowTrack: trackList;
  columnTrack: trackList;
  autoRowTrack: trackList;
  autoRowIndex: number = 0; // index of grid-auto-row
  autoColumnTrack: trackList;
  autoColumnIndex: number = 0; // index of grid-auto-column
  constructor(container: Container) {
    this.ceils = [];
    this.areaNames = {};
    this.container = container;
    this.rowTrack = <trackList>container.config.gridTemplateRows || [];
    this.columnTrack = <trackList>container.config.gridTemplateColumns || [];
    this.autoRowTrack = <trackList>container.config.gridAutoRows || [{
      type: 'auto'
    }];
    this.autoColumnTrack = <trackList>container.config.gridAutoColumns || [{
      type: 'auto'
    }];
  }
  get rowSize(): number {
    return this.rowTrack.length;
  }
  get columnSize(): number {
    return this.columnTrack.length;
  }
  private getInitCeil(row?: number, column?: number): ceil {
    return {
      row: row || 0,
      column: column || 0,
      node: []
    }
  }
  // put node in ceil
  putNodeInCeil(row: number, column: number, node: Node): void {
    if (!this.ceils[row]) {
      this.ceils[row] = [];
      if (this.rowTrack.length < row) {
        for (let i = this.rowTrack.length; i < row; i++) {
          this.rowTrack[i] = this.autoRowTrack[this.autoRowIndex++ % this.autoRowTrack.length];
        }
      }
    }
    if (this.columnTrack.length < column) {
      for (let i = this.columnTrack.length; i < column; i++) {
        this.columnTrack[i] = this.autoColumnTrack[this.autoColumnIndex++ % this.autoColumnTrack.length];
      }
    }
    if (!this.ceils[row][column]) {
      this.ceils[row][column] = this.getInitCeil(row, column);
    }
    this.ceils[row][column].node.push(node);
  }

  public fromAreas(areas: string[][]) {
    areas.forEach((line, row) => {
      line.forEach((name, column) => {
        if (!name) return;
        if (!this.areaNames[name]) {
          this.areaNames[name] = [];
        }
        this.areaNames[name].push({ row, column });
      })
    })
  }

  public fromNodes(nodes: Node[]) {
    nodes.forEach(node => {
      const area = node.config.gridArea;
      // put node in container by grid-area
      if (area && this.areaNames[area]) {
        this.areaNames[area].forEach(pos => {
          this.putNodeInCeil(pos.row, pos.column, node);
          node.gridPos.push(pos);
        })
        return;
      }
      if (this.putFixedPositionNode(node)) return;
    })
  }
  private putFixedPositionNode(node: Node): boolean {
    const { gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd } = node.config;
    if ((gridColumnStart || gridColumnEnd) && (gridRowStart || gridRowEnd)) {
      if (gridColumnStart) {

      }
      return true;
    }
    return false;
  }
}