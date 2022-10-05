import { ICheckResultView } from './bundled';
import { IRelation, RelationTypeEnum } from './types';

export default (checkResult: ICheckResultView): IRelation => {
  let type = RelationTypeEnum.relate;
  if (checkResult.dirty) {
    type = RelationTypeEnum.dirty;
  }
  return {
    id: checkResult.id,
    fromRange: checkResult.fromOriginalRange,
    toRange: checkResult.toOriginalRange,
    type,
  };
};
