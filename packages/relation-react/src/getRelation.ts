import { IRelationWithOriginalContentInfo } from './RelationEditor/getRelationsWithOriginalContents';
import { IRelation, RelationTypeEnum } from './types';

export default (
  relationsWithOriginalRange: IRelationWithOriginalContentInfo
): IRelation => {
  let type = RelationTypeEnum.relate;
  if (relationsWithOriginalRange.dirty) {
    type = RelationTypeEnum.dirty;
  }
  return {
    id: relationsWithOriginalRange.id,
    fromRange: relationsWithOriginalRange.fromOriginalRange,
    toRange: relationsWithOriginalRange.toOriginalRange,
    type,
  };
};
