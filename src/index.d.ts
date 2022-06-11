export interface IRawRelation {
  rev: string;
  path: string;
  range: [number, number];
  srcRev: string;
  srcPath: string;
  srcRange: [number, number];
}

export interface IExtra {
  dirty: boolean;
}

export type ILineRange = [number, number, IExtra] | [number, number];

export type ILinesRelationMap = Map<ILineRange, ILineRange>;

export interface ILinesRelation {
  oldLines: ILineRange[];
  newLines: ILineRange[];
  oldLinesRelationMap: ILinesRelationMap;
  newLinesRelationMap: ILinesRelationMap;
}

export interface ILinesRelationView {
  oldLines: ILineRange[];
  newLines: ILineRange[];
  oldLinesRelationMap: [ILineRange, ILineRange][];
  newLinesRelationMap: [ILineRange, ILineRange][];
}

export interface ICheckResultBasic extends IRawRelation {
  dirty: boolean;
  content: string;
  contentHEAD: string;
  relationRange: [number, number];
  srcContent: string;
  srcContentHEAD: string;
  srcRelationRange: [number, number];
}

export interface ICheckResult extends ICheckResultBasic {
  linesRelation: ILinesRelation;
  srcLinesRelation: ILinesRelation;
}

export interface ICheckResultView extends ICheckResultBasic {
  linesRelation: ILinesRelationView;
  srcLinesRelation: ILinesRelationView;
}
