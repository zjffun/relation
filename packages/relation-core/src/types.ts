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

export interface IViewerContents {
  [key: string]: string;
}

export interface IViewerRelation extends IRawRelationCommon {
  id: string;
  fromRange: [number, number];
  toRange: [number, number];
  originalFromViewerContentRev: string;
  originalToViewerContentRev: string;
}

export interface IRelationViewerData {
  fromPath: string;
  toPath: string;
  fromModifiedContent: string;
  toModifiedContent: string;
  viewerRelations: IViewerRelation[];
  viewerContents: IViewerContents;
}

export interface IOptions extends Partial<IRawRelation> {
  cwd?: string;
}
