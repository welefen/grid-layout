import { Tokenizer } from './base';

const trackListSplitChars = '()[],/';

export class TrackTokenizer extends Tokenizer {
  getTokens(): string[] {
    const tokens: string[] = [];
    let token: string = '';
    let index: number = 0;
    while (index < this.length) {
      const char = this.text[index];
      const isWhitespace = this.isWhitespace(char);
      if (isWhitespace || trackListSplitChars.indexOf(char) > -1) {
        if (token) {
          tokens.push(token);
          token = '';
        }
        index++;
        if (!isWhitespace) {
          tokens.push(char);
        }
        continue;
      }
      token += char;
      index++;
    }
    if (token) {
      tokens.push(token);
    }
    return tokens;
  }
}
