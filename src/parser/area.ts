import { Parser } from './base';
import { AreaTokenizer } from '../tokenizer/area';

export class AreaParser extends Parser {
  parse() {
    const instance = new AreaTokenizer(this.text);
    const tokens: string[][] = instance.getTokens();
    const maxColumns = Math.max(...tokens.map(columns => columns.length));
    const maxColumnsArr = [...new Array(maxColumns)];
    const names: string[] = [];
    tokens.forEach((row, rowIndex) => {
      maxColumnsArr.forEach((_, columnIndex) => {
        const column = (row[columnIndex] || '').replace(/\.+/, ''); //replace multi `.` to empty
        if (column !== '' && !names.includes(column)) {
          this.checkAreaName(tokens, rowIndex, columnIndex);
          names.push(column);
        }
        row[columnIndex] = column;
      })
    })
    return tokens;
  }
  checkAreaName(tokens: string[][], rowIndex: number, columnIndex: number) {
    const name = tokens[rowIndex][columnIndex];
    let maxRow = rowIndex;
    let maxColumn = columnIndex;
    for (let i = rowIndex, length = tokens.length; i < length; i++) {
      const start = i === rowIndex ? columnIndex + 1 : 0;
      for (let j = start; j < tokens[i].length; j++) {
        const item = tokens[i][j];
        if (item === name) {
          if (j < columnIndex) {
            throw new Error('areas is not valid');
          }
          maxRow = Math.max(maxRow, i);
          maxColumn = Math.max(maxColumn, j);
        }
      }
    }
    for (let i = rowIndex; i <= maxRow; i++) {
      for (let j = columnIndex; j <= maxColumn; j++) {
        if (tokens[i][j] !== name) {
          throw new Error('areas is not valid');
        }
      }
    }
  }
}