export class Parser {
  tokens: string[];
  text: string;
  index: number = 0;
  length: number;
  constructor(text: string) {
    this.text = text;
  }
  nextNeed(token: string) {
    if (this.peek() !== token) {
      throw new Error(`next token must be ${token}`);
    }
  }
  peek() {
    return this.tokens[this.index++];
  }
}