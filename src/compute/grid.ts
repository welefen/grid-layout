import deepmerge from 'ts-deepmerge';
import { ceil, position, trackList, gridLine, autoFlow, placement } from '../config';
import { Node } from '../node';
import { Container } from '../container';


interface AreaNames {
  [key: string]: position[];
}

export class GridCompute {
  ceils: ceil[][] = [];
  areaNames: AreaNames = {};
  container: Container;
  rowTrack: trackList;
  columnTrack: trackList;
  autoRowTrack: trackList;
  autoRowIndex: number = 0; // index of grid-auto-row
  autoColumnTrack: trackList;
  autoColumnIndex: number = 0; // index of grid-auto-column
  autoFlow: autoFlow;
  constructor(container: Container) {
    this.container = container;
    this.rowTrack = <trackList>container.config.gridTemplateRows || [];
    this.columnTrack = <trackList>container.config.gridTemplateColumns || [];
    this.autoRowTrack = <trackList>container.config.gridAutoRows || [];
    if (!this.autoRowTrack.length) {
      this.autoRowTrack[0] = { type: 'auto', baseSize: 0, growthLimit: Infinity };
    }
    if (!this.rowTrack.length) {
      this.rowTrack[0] = this.autoRowTrack[0];
    }
    this.autoColumnTrack = <trackList>container.config.gridAutoColumns || [];
    if (!this.autoColumnTrack.length) {
      this.autoColumnTrack[0] = { type: 'auto', baseSize: 0, growthLimit: Infinity };
    }
    if (!this.columnTrack.length) {
      this.columnTrack[0] = this.autoColumnTrack[0];
    }
    this.autoFlow = <autoFlow>this.container.config.gridAutoFlow || {};
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
      this.flexTrackSize('row', row);
    }
    this.flexTrackSize('column', column);
    if (!this.ceils[row][column]) {
      this.ceils[row][column] = this.getInitCeil(row, column);
    }
    this.ceils[row][column].node.push(node);
    node.position.push({ row, column });
  }
  /**
   * flex track size
   * @param type track type
   * @param size 
   */
  private flexTrackSize(type: 'row' | 'column', size: number): void {
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
    const autoNodes: Node[] = [];
    const givedNodes: Node[] = [];
    nodes.forEach(node => {
      const area = node.config.gridArea;
      // put node in container by grid-area
      if (area && this.areaNames[area]) {
        this.areaNames[area].forEach(pos => {
          this.putNodeInCeil(pos.row, pos.column, node);
        })
        return;
      }
      const { gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd } = node.config;
      const rowPlacement = this.parseGridPlacement(this.rowTrack, <gridLine>gridRowStart, <gridLine>gridRowEnd);
      const columnPlacement = this.parseGridPlacement(this.columnTrack, <gridLine>gridColumnStart, <gridLine>gridColumnEnd);
      if (rowPlacement.start > -1 && columnPlacement.start > -1) {
        for (let i = rowPlacement.start; i < rowPlacement.end; i++) {
          for (let j = columnPlacement.start; j < columnPlacement.end; j++) {
            this.putNodeInCeil(i, j, node);
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
          if (this.ceils[rowIndex] && this.ceils[rowIndex][columnIndex] && this.ceils[rowIndex][columnIndex]) {
            empty = false;
            break;
          }
        }
        if (empty) {
          for (let j = placement.start; j < placement.end; j++) {
            const rowIndex = isRow ? j : i;
            const columnIndex = isRow ? i : j;
            this.putNodeInCeil(rowIndex, columnIndex, node);
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
   * try to set node in ceils
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
        if (this.ceils[i] && this.ceils[i][j] && this.ceils[i][j].node.length) {
          return false;
        }
      }
    }
    for (let i = rowIndex; i < rowEnd; i++) {
      for (let j = columnIndex; j < columnEnd; j++) {
        this.putNodeInCeil(i, j, node);
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
  private findPositionByCustomIndent(track: trackList, gridLine: gridLine, type: string = 'start'): number {
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
  private parseGridPlacement(track: trackList, start?: gridLine, end?: gridLine) {
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