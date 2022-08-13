import { ILinesRelationView, ICheckResultBasic } from "relation2-core";

export interface ICheckResultView extends ICheckResultBasic {
  fromLinesRelation: ILinesRelationView;
  toLinesRelation: ILinesRelationView;
}

export enum RelationEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
}
