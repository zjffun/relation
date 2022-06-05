export interface IRawRelation {
  rev: string;
  path: string;
  range: [number, number];
  srcRev: string;
  srcPath: string;
  srcRange: [number, number];
}

export interface IRelation {
  start?: number;
  end?: number;
  dirty?: boolean;
  // any other information
  [key: string]: any;
}
