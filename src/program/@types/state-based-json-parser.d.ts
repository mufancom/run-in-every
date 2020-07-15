declare module 'state-based-json-parser' {
  interface ParseResult {
    value: unknown;
    index: number;
    errorCode?: string;
  }

  class JSONParser {
    parse(input: string, index?: number): ParseResult;
  }

  export = JSONParser;
}
