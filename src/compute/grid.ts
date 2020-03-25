import deepmerge from 'ts-deepmerge';
import { GridCell, TrackList, GridLine, GridAutoFlow, TrackType } from '../util/config';
import { Node } from '../node';
import { Container } from '../container';


interface position {
  row: number;
  column: number;
}

interface AreaNames {
  [key: string]: position[];
}

export class GridCompute {
  cells: GridCell[][] = [];
  areaNames: AreaNames = {};
  container: Container;
  rowTrack: TrackList;
  columnTrack: TrackList;
  autoRowTrack: TrackList;
  autoRowIndex: number = 0; // index of grid-auto-row
  autoColumnTrack: TrackList;
  autoColumnIndex: number = 0; // index of grid-auto-column
  autoFlow: GridAutoFlow;
  constructor(container: Container) {
    this.container = container;
    this.rowTrack = <TrackList>container.config.gridTemplateRows || [];
    this.columnTrack = <TrackList>container.config.gridTemplateColumns || [];
    this.autoRowTrack = <TrackList>container.config.gridAutoRows || [];
    if (!this.autoRowTrack.length) {
      this.autoRowTrack[0] = { type: 'auto', baseSize: 0, growthLimit: Infinity };
    }
    if (!this.rowTrack.length) {
      this.rowTrack[0] = this.autoRowTrack[0];
    }
    this.autoColumnTrack = <TrackList>container.config.gridAutoColumns || [];
    if (!this.autoColumnTrack.length) {
      this.autoColumnTrack[0] = { type: 'auto', baseSize: 0, growthLimit: Infinity };
    }
    if (!this.columnTrack.length) {
      this.columnTrack[0] = this.autoColumnTrack[0];
    }
    this.autoFlow = <GridAutoFlow>this.container.config.gridAutoFlow || {};
  }
  get rowSize(): number {
    return this.rowTrack.length;
  }
  get columnSize(): number {
    return this.columnTrack.length;
  }
  private getInitCell(row?: number, column?: number): GridCell {
    return {
      row: row || 0,
      column: column || 0,
      node: []
    }
  }
  // put node in cell
  putNodeInCell(row: number, column: number, node: Node): void {
    if (!this.cells[row]) {
      this.cells[row] = [];
      this.flexTrackSize('row', row);
    }
    this.flexTrackSize('column', column);
    if (!this.cells[row][column]) {
      this.cells[row][column] = this.getInitCell(row, column);
    }
    this.cells[row][column].node.push(node);
    node.cells.push(this.cells[row][column]);
  }
  /**
   * flex track size
   * @param type track type
   * @param size 
   */
  private flexTrackSize(type: TrackType, size: number): void {
    const isRow = type === 'row';
    const track = isRow ? this.rowTrack : this.columnTrack;
    const autoTrack = isRow ? this.autoRowTrack : this.autoColumnTrack;
    if (track.length < size) {
      const length = autoTrack.length;
      for (let i = track.length; i < size; i++) {
        if (isRow) {
          track[i] = deepmerge({}, autoTrack[this.autoRowIndex++ % length]);
        } else {
          track[i] = deepmerge({}, autoTrack[this.autoColumnIndex++ % length]);
        }
      }
    }
  }

  public setAreas(areas: string[][]) {
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

  public putNodes(nodes: Node[]) {
    const autoNodes: Node[] = [];
    const givedNodes: Node[] = [];
    nodes.forEach(node => {
      const area = node.config.gridArea;
      // put node in container by grid-area
      if (area && this.areaNames[area]) {
        this.areaNames[area].forEach(pos => {
          this.putNodeInCell(pos.row, pos.column, node);
        })
        return;
      }
      const { gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd } = node.config;
      const rowPlacement = this.parseGridPlacement(this.rowTrack, <GridLine>gridRowStart, <GridLine>gridRowEnd);
      const columnPlacement = this.parseGridPlacement(this.columnTrack, <GridLine>gridColumnStart, <GridLine>gridColumnEnd);
      if (rowPlacement.start > -1 && columnPlacement.start > -1) {
        for (let i = rowPlacement.start; i < rowPlacement.end; i++) {
          for (let j = columnPlacement.start; j < columnPlacement.end; j++) {
            this.putNodeInCell(i, j, node);
            return;
          }
        }
      }
      node.placement = { row: rowPlacement, column: columnPlacement };
      if (rowPlacement.start > -1) {
        this.flexTrackSize('row', rowPlacement.end + 1);
        // autoflow is row
        if (!this.autoFlow.column) {
          givedNodes.push(node);
          return;
        }
      }
      if (columnPlacement.start > -1) {
        this.flexTrackSize('column', columnPlacement.end);
        // autoflow is column
        if (this.autoFlow.column) {
          givedNodes.push(node);
          return;
        }
      }
      autoNodes.push(node);
    });
    this.putGivedNodes(givedNodes);
    this.putAutoNodes(autoNodes);
  }
  /**
   * put gived postion node
   * @param nodes 
   */
  private putGivedNodes(nodes: Node[]) {
    let index: number = 0;
    nodes.forEach(node => {
      const isRow = node.placement.row.start > -1;
      const placement = isRow ? node.placement.row : node.placement.column;
      let i = index;
      while (true) {
        let empty = true;
        for (let j = placement.start; j < placement.end; j++) {
          const rowIndex = isRow ? j : i;
          const columnIndex = isRow ? i : j;
          if (this.cells[rowIndex] && this.cells[rowIndex][columnIndex] && this.cells[rowIndex][columnIndex]) {
            empty = false;
            break;
          }
        }
        if (empty) {
          for (let j = placement.start; j < placement.end; j++) {
            const rowIndex = isRow ? j : i;
            const columnIndex = isRow ? i : j;
            this.putNodeInCell(rowIndex, columnIndex, node);
          }
          break;
        }
        i++;
      }
      this.flexTrackSize(isRow ? 'row' : 'column', i);
      index = this.autoFlow.dense ? 0 : i;
    })
  }
  /**
   * try to set node in cells
   * @param node 
   * @param placement 
   * @param row 
   * @param column 
   */
  private tryToSetNode(node: Node, rowIndex: number, columnIndex: number) {
    const { row, column } = node.placement;
    if (row.start > - 1 && row.start !== rowIndex) return false;
    if (column.start > -1 && column.start !== columnIndex) return false;
    const rowEnd = row.end === -1 ? rowIndex + 1 : row.end;
    const columnEnd = column.end === - 1 ? columnIndex + 1 : column.end;
    for (let i = rowIndex; i < rowEnd; i++) {
      for (let j = columnIndex; j < columnEnd; j++) {
        if (this.cells[i] && this.cells[i][j] && this.cells[i][j].node.length) {
          return false;
        }
      }
    }
    for (let i = rowIndex; i < rowEnd; i++) {
      for (let j = columnIndex; j < columnEnd; j++) {
        this.putNodeInCell(i, j, node);
      }
    }
    return true;
  }
  private putAutoNodes(nodes: Node[]) {
    let rowIndex: number = 0;
    let columnIndex: number = 0;
    nodes.forEach(node => {
      const isColumnFlow = !!this.autoFlow.column;
      if (!isColumnFlow) {
        let i = rowIndex;
        const columnSize = this.columnSize;
        while (true) {
          let flag = false;
          for (let j = columnIndex; j < columnSize; j++) {
            if (this.tryToSetNode(node, i, j)) {
              columnIndex = j;
              flag = true;
              break;
            }
          }
          if (!flag) {
            columnIndex = 0;
          } else {
            rowIndex = i;
            break;
          }
          i++;
        }
        this.flexTrackSize('row', i + 1);
      } else {
        let i = columnIndex;
        const rowSize = this.rowSize;
        while (true) {
          let flag = false;
          for (let j = rowIndex; j < rowSize; j++) {
            if (this.tryToSetNode(node, j, i)) {
              rowIndex = j;
              flag = true;
              break;
            }
          }
          if (!flag) {
            rowIndex = 0;
          } else {
            columnIndex = i;
            break;
          }
          i++;
        }
        this.flexTrackSize('column', i + 1);
      }
      if (this.autoFlow.dense) {
        rowIndex = columnIndex = 0;
      }
    })
  }
  private findPositionByCustomIndent(track: TrackList, gridLine: GridLine, type: string = 'start'): number {
    let index = -1;
    let num = 0;
    let { customIndent, integer = 1 } = gridLine;
    // end: C -1
    if (integer < 0) {
      track = track.reverse();
      integer = -integer;
    }
    track.some((item, idx) => {
      const lineNames = type === 'string' ? item.lineNamesStart : item.lineNamesEnd;
      if (lineNames.includes(customIndent)) {
        num++;
      }
      if (num === integer) {
        index = idx;
        return true;
      }
    });
    return index;
  }
  private parseGridPlacement(track: TrackList, start?: GridLine, end?: GridLine) {
    let startIndex = -1;
    let endIndex = -1;
    if (start) {
      if (start.span) {
        if (!end) throw new Error('end must be set');
        if (end.span) throw new Error('end can not have span');
        endIndex = this.findPositionByCustomIndent(track, end, 'end');
        if (endIndex === -1) throw new Error('can not find end index');
        // start: span C, end: C -1
        if (start.customIndent) {
          for (let i = endIndex - 1; i > 0; i--) {
            const item = track[i];
            if (item.lineNamesStart.includes(start.customIndent)) {
              startIndex = i;
              break;
            }
          }
        } else if (start.integer) {
          startIndex = endIndex - start.integer;
          if (startIndex < 0) throw new Error('start index < 0');
        }
      } else {
        if (start.customIndent) {
          startIndex = this.findPositionByCustomIndent(track, start, 'start');
        } else {
          startIndex = start.integer - 1;
        }
        if (end) {
          if (end.span && end.customIndent) {
            for (let i = startIndex; i < track.length; i++) {
              const item = track[i];
              if (item.lineNamesEnd.includes(end.customIndent)) {
                endIndex = i;
                break;
              }
            }
          } else if (end.span && end.integer) {
            endIndex = startIndex + end.integer;
          } else if (end.customIndent) {
            endIndex = this.findPositionByCustomIndent(track, end, 'end');
          } else if (end.integer) {
            endIndex = end.integer - 1;
          }
        }
      }
    } else {
      if (end) {
        if (end.span) throw new Error('end has span');
        if (end.customIndent) {
          endIndex = this.findPositionByCustomIndent(track, end, 'end');
        } else if (end.integer) {
          endIndex = end.integer - 1;
        }
      }
    }
    if (startIndex > -1) {
      if (endIndex === -1) {
        endIndex = startIndex + 1;
      }
    } else if (endIndex > -1) {
      if (startIndex === -1) {
        startIndex = endIndex - 1;
      }
    }
    if (startIndex !== -1 && startIndex === endIndex) {
      endIndex++;
    }
    if (startIndex > endIndex) {
      throw new Error('start index max than end index');
    }
    return { start: startIndex, end: endIndex };
  }
}