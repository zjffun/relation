export enum RELATION_TYPE {
  FILE = "FILE",
  SECTION = "SECTION",
}

export interface IRelation {
  type: RELATION_TYPE;
  start?: number;
  end?: number;
  // any other infomation
  [key: string]: any;
}

export interface IRealationCheckProp {
  oldFile?: string;
  newFile?: string;
  relations?: IRelation[];
}

export const realationCheck = ({
  oldFile = "",
  newFile = "",
  relations = [],
}: IRealationCheckProp = {}): IRelation[] => {
  return relations;
};
