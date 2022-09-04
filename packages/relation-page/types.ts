import {
  ICheckResultBasic,
  ICheckResultCommon,
  IOriginalAndModifiedContentResult,
  IRawRelationBasic,
  IRawRelationCommon,
} from "relation2-core";

export interface ICheckResult extends ICheckResultBasic, IRawRelationBasic {}

export interface ICheckResultView
  extends IRawRelationCommon,
    ICheckResultCommon {
  id: number;
  key: string;
  checkResults: ICheckResult[];
  originalAndModifiedContent?: IOriginalAndModifiedContentResult;
  dirty?: boolean;
}

export type IRelation = {
  id?: string;
  fromRange: [number, number];
  toRange: [number, number];
  type: RelationTypeEnum;
};

export enum RelationTypeEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
}
