import { IRelationWithOriginalContentInfo } from './RelationEditor/getRelationsWithOriginalContent';
import { IRelation, RelationTypeEnum } from './types';

export default (
  relationsWithModifiedRange: IRelationWithOriginalContentInfo
): IRelation => {
  let type = RelationTypeEnum.relate;
  if (relationsWithModifiedRange.dirty) {
    type = RelationTypeEnum.dirty;
  }
  return {
    id: relationsWithModifiedRange.id,
    fromRange: relationsWithModifiedRange.fromOriginalRange,
    toRange: relationsWithModifiedRange.toOriginalRange,
    type,
  };
};
