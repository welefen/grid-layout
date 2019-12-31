import { area, nodePos, trackList } from '../config';
import { Node } from '../node';
import { TrackCompute } from './track';
import { Container } from '../container';

interface AreaNames {
  [key: string]: nodePos[];
}

export class AreaCompute {
  areas: area[][];
  areaNames: AreaNames;
  container: Container;
  rowTrackList: trackList;
  columnTrackList: trackList;
  constructor(container: Container) {
    this.areas = [];
    this.areaNames = {};
    this.container = container;
  }
  get rowSize(): number {
    return this.areas.length;
  }
  get columnSize(): number {
    return this.areas[0] && this.areas[0].length || 0;
  }
  private getInitArea(row?: number, column?: number): area {
    return {
      row: row || 0,
      column: column || 0,
      explicit: false,
      topLineNames: [],
      rightLineNames: [],
      bottomLineNames: [],
      leftLineNames: [],
      node: []
    }
  }
  /**
   * add row for areas
   */
  private addRow(): void {
    const gridTemplateRows = this.container.config.gridTemplateRows;
    if (!gridTemplateRows) {
      const columnSize = this.columnSize;
      if (!columnSize) {
        this.areas.push([]);
      } else {
        const line = [];
        for (let i = 0; i < columnSize; i++) {
          const item: area = this.getInitArea(this.areas.length, i);
          line.push(item);
        }
        this.areas.push(line);
      }
      return;
    }
    const { tracks, lineNames } = <trackList>gridTemplateRows;
    const columnSize = Math.max(tracks.length, this.columnSize);
    const lines: area[] = [];
    for (let i = 0; i < columnSize; i++) {
      const data: area = this.getInitArea(this.areas.length, i);
      if (i < tracks.length - 1) {
        data.leftLineNames = tracks[i].lineNames.slice();
        data.rightLineNames = tracks[i + 1].lineNames.slice();
      } else if (i === tracks.length - 1) {
        data.leftLineNames = tracks[i].lineNames.slice();
        data.rightLineNames = lineNames.slice();
      }
      lines.push(data);
    }
    this.areas.push(lines);
  }
  /**
   * add column for areas
   */
  private addColumn(): void {
    const gridTemplateColumns = this.container.config.gridTemplateColumns;
    if (!gridTemplateColumns) {
      const columnSize = this.columnSize;
      this.areas.forEach((line, index) => {
        const data = this.getInitArea(index, columnSize);
        line[columnSize] = data;
      })
      return;
    }
    const { tracks, lineNames } = <trackList>gridTemplateColumns;
    const rowSize = Math.max(tracks.length, this.rowSize);
    const columnSize = this.columnSize;
    for (let i = 0; i < rowSize; i++) {
      const item: area = this.getInitArea(i, columnSize);
      if (i < tracks.length - 1) {
        item.topLineNames = tracks[i].lineNames.slice();
        item.bottomLineNames = tracks[i + 1].lineNames.slice();
      } else if (i === tracks.length - 1) {
        item.topLineNames = tracks[i].lineNames.slice();
        item.bottomLineNames = lineNames.slice();
      }
      this.areas[i][columnSize] = item;
    }
  }
  /**
   * create grids from track
   */
  public fromTrack(): void {
    const {gridTemplateRows, gridTemplateColumns} = this.container.config;
    if (!gridTemplateRows && !gridTemplateColumns) return;
    const rowSize = gridTemplateRows && (<trackList>gridTemplateRows).tracks.length || 1;
    const columnSize = gridTemplateColumns && (<trackList>gridTemplateColumns).tracks.length || 1;
    for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
      const line: area[] = [];
      for (let columnIndex = 0; columnIndex < columnSize; columnIndex++) {
        const item: area = this.getInitArea(rowIndex, columnIndex);
        if (gridTemplateRows) {
          const { tracks, lineNames } = <trackList>gridTemplateRows;
          item.topLineNames = tracks[rowIndex].lineNames.slice();
          item.bottomLineNames = rowIndex === rowSize - 1 ? lineNames.slice() : tracks[rowIndex + 1].lineNames.slice();
        }
        if (gridTemplateColumns) {
          const { tracks, lineNames } = <trackList>gridTemplateColumns;
          item.leftLineNames = tracks[rowIndex].lineNames.slice();
          item.rightLineNames = columnIndex === columnSize - 1 ? lineNames.slice() : tracks[columnIndex + 1].lineNames.slice();
        }
        line.push(item);
      }
      this.areas[rowIndex] = line;
    }
  }

  public fromAreas(areas: string[][]) {
    const names: AreaNames = {};
    areas.forEach((line, rowIndex) => {
      if (!this.areas[rowIndex]) {
        this.addRow();
      }
      line.forEach((name, columnIndex) => {
        if (!this.areas[rowIndex][columnIndex]) {
          this.addColumn();
        }
        if (!name) return;
        if (!names[name]) {
          names[name] = [];
        }
        names[name].push({ row: rowIndex, column: columnIndex });
      })
    })
    this.areaNames = names;
    Object.keys(names).forEach(name => {
      const rows = names[name].map(item => item.row);
      const columns = names[name].map(item => item.column);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      const minColumn = Math.min(...columns);
      const maxColumn = Math.max(...columns);
      names[name].map(item => {
        const area = this.areas[item.row][item.column];
        if (item.row === minRow) {
          area.topLineNames.push(`${name}-start`);
        }
        if (item.row === maxRow) {
          area.bottomLineNames.push(`${name}-end`);
        }
        if (item.column === minColumn) {
          area.leftLineNames.push(`${name}-start`);
        }
        if (item.column === maxColumn) {
          area.rightLineNames.push(`${name}-end`);
        }
      })
    })
  }
  public fromNodes(nodes: Node[]) {
    nodes.forEach(node => {
      const area = node.config.gridArea;
      // put node in container by grid-area
      if (area && this.areaNames[area]) {
        this.areaNames[area].forEach(pos => {
          this.areas[pos.row][pos.column].node.push(node);
          node.gridPos.push(pos);
        })
        return;
      }
      if(this.putFixedPositionNode(node)) return;
    })
  }
  private putFixedPositionNode(node: Node): boolean {
    const {gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd} = node.config;
    if((gridColumnStart || gridColumnEnd) && (gridRowStart || gridRowEnd)) {
      if(gridColumnStart) {
        
      }
      return true;
    }
    return false;
  }
}