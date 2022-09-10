import { Selection } from "d3-selection";

export type IRelation = {
  id?: string;
  fromRange: [number, number];
  toRange: [number, number];
  type: RelationTypeEnum;
};

export type ISetOptions = (
  selection: Selection<HTMLBodyElement, unknown, null, undefined>
) => void;

export enum RelationTypeEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
}
