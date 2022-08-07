import { ILinesRelationView, ICheckResultBasic } from "relation2-core";

export interface ICheckResultView extends ICheckResultBasic {
  fromLinesRelation: ILinesRelationView;
  toLinesRelation: ILinesRelationView;
}
