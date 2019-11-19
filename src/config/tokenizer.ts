
const whitespace = ' \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';

const trackListSplitChars = '()[],/';

class Tokenizer {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  isWhitespace(char: string): boolean {
    return whitespace.indexOf(char) > -1;
  }
}


export class TrackListTokenizer extends Tokenizer {
  getTokens(): string[] {
    const tokens: string[] = [];
    const length: number = this.text.length;
    let token: string = '';
    let index: number = 0;
    while(index < length) {
      const char = this.text[index];
      const isWhitespace = this.isWhitespace(char);
      if (isWhitespace || trackListSplitChars.indexOf(char) > -1) {
        if (token) {
          tokens.push(token);
          token = '';
        }
        index++;
        if(!isWhitespace) {
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
