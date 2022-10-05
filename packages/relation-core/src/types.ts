export interface IRawRelationCommon {
  fromPath: string;
  fromBaseDir: string;
  toPath: string;
  toBaseDir: string;
}

export interface IRawRelationBasic {
  id?: string;
  fromRange: [number, number];
  toRange: [number, number];
  fromRev: string;
  toRev: string;
}

export interface IRawRelation extends IRawRelationCommon, IRawRelationBasic {}

export enum LineRelationTypeEnum {
  ADDED = "ADDED",
  REMOVED = "REMOVED",
  MODIFIED = "MODIFIED",
}

export enum PartTypeEnum {
  FROM = "from",
  TO = "to",
}

export interface ILineRelation {
  originalRange: [number, number];
  modifiedRange: [number, number];
  type?: LineRelationTypeEnum;
}

export interface ICheckResultCommon {
  currentFromRev: string;
  currentToRev: string;
}

export interface ICheckResultBasic {
  dirty: boolean;
  fromModifiedRange: [number, number];
  toModifiedRange: [number, number];
}

export interface ICheckResult
  extends ICheckResultBasic,
    ICheckResultCommon,
    IRawRelation {}

export interface IOptions extends Partial<IRawRelation> {
  cwd?: string;
}

export interface ICheckResultView extends ICheckResultBasic, IRawRelationBasic {
  fromOriginalRange: [number, number];
  toOriginalRange: [number, number];
}

export interface IViewData extends IRawRelationCommon, ICheckResultCommon {
  id: number;
  key: string;
  checkResults: ICheckResultView[];
  fileContents: IFileContents;
  dirty?: boolean;
}

export interface IFileContents {
  [key: string]: string;
}
