import { ICheckResult } from 'relation2-core';
import { IRelation, RelationTypeEnum } from './types';

export default (checkResult: ICheckResult): IRelation => {
  let type = RelationTypeEnum.relate;
  if (checkResult.dirty) {
    type = RelationTypeEnum.dirty;
  }
  return {
    id: checkResult.id,
    fromRange: checkResult.fromModifiedRange,
    toRange: checkResult.toModifiedRange,
    type,
  };
};
