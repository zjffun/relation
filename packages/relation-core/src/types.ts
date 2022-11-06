export interface IRawRelationCommon {
  fromContentRev?: string;
  toContentRev?: string;
  fromGitRev?: string;
  toGitRev?: string;
  fromGitWorkingDirectory?: string;
  toGitWorkingDirectory?: string;
}

export interface IRawRelationBasic {
  id: string;
  fromRange: [number, number];
  toRange: [number, number];
  fromPath: string;
  toPath: string;
}

export interface IRawRelation extends IRawRelationCommon, IRawRelationBasic {}

export interface IRawRelationWithContentInfo extends IRawRelation {
  _originalFromContentRev: string;
  _originalToContentRev: string;
  _modifiedFromContentRev: string;
  _modifiedToContentRev: string;
}

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

export interface ICheckResultBasic {
  dirty: boolean;
  fromModifiedRange: [number, number];
  toModifiedRange: [number, number];
  fromOriginalRange: [number, number];
  toOriginalRange: [number, number];
}

export interface ICheckResult
  extends ICheckResultBasic,
    IRawRelationWithContentInfo {}

export interface IOptions extends Partial<IRawRelation> {
  cwd?: string;
}

export interface IContents {
  [key: string]: string;
}

export interface IRelationsWithContents {
  relationsWithContentInfo: IRawRelationWithContentInfo[];
  contents: IContents;
}
