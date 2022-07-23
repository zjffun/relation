export interface IRawRelation {
  id?: string;
  fromRev: string;
  fromPath: string;
  fromRange: [number, number];
  toRev: string;
  toPath: string;
  toRange: [number, number];
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
  fromContent: string;
  fromContentHEAD: string;
  fromRelationRange: [number, number];
  toContent: string;
  toContentHEAD: string;
  toRelationRange: [number, number];
}

export interface ICheckResult extends ICheckResultBasic {
  fromLinesRelation: ILinesRelation;
  toLinesRelation: ILinesRelation;
}

export interface ICheckResultView extends ICheckResultBasic {
  fromLinesRelation: ILinesRelationView;
  toLinesRelation: ILinesRelationView;
}

export interface IOptions extends Partial<IRawRelation> {
  cwd?: string;
}
