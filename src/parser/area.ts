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
    let type: string = '';
    for (let i = rowIndex, length = tokens.length; i < length; i++) {
      const start = i === rowIndex ? columnIndex + 1 : 0;
      for (let j = start; j < tokens[i].length; j++) {
        const item = tokens[i][j];
        if (name === item) {
          let err: boolean = false;
          if (rowIndex !== i && columnIndex !== j) {
            err = true;
          } else if (type === 'row' && columnIndex === j) {
            err = true;
          } else if (type === 'column' && rowIndex === i) {
            err = true;
          } else if (!type && columnIndex === j) {
            type = 'column';
          } else if (!type && rowIndex === i) {
            type = 'row';
          }
          if (err) {
            throw new Error(`area name ${name} not valid`);
          }
        }
      }
    }
  }
}