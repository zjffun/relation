import { IRawRelationWithContentInfo } from '../../src';
import getRelationsWithModifiedRange from '../../src/RelationEditor/getRelationsWithModifiedRange';
import getRelationsWithOriginalContent from '../../src/RelationEditor/getRelationsWithOriginalContent';

describe('RelationEditor', () => {
  describe('getRelationsWithOriginalContent', () => {
    it('Should work', async () => {
      const contents = {
        _originalFromContentRev: 'test1\ntest2\n',
        _modifiedFromContentRev: 'test1\nadd\ntest2\n',
        _originalToContentRev: 'test1\nwill-delete\ntest2\n',
        _modifiedToContentRev: 'test1\ntest2\n',
      };
      const relationsWithModifiedRange = await getRelationsWithModifiedRange({
        relationsWithContentInfo: [
          {
            id: '0',
            fromPath: 'fromPath',
            toPath: 'toPath',
            fromRange: [1, 2],
            toRange: [1, 3],
            _originalFromContentRev: '_originalFromContentRev',
            _modifiedFromContentRev: '_modifiedFromContentRev',
            _originalToContentRev: '_originalToContentRev',
            _modifiedToContentRev: '_modifiedToContentRev',
          },
        ],
        contents,
      });

      const relationsWithOriginalContent = await getRelationsWithOriginalContent(
        {
          relationsWithModifiedRange,
          contents,
        }
      );

      const [relations, newContents] = relationsWithOriginalContent;

      expect(newContents.fromOriginalContentRev).toBe('test1\ntest2\n');
      expect(newContents.toOriginalContentRev).toBe(
        'test1\nwill-delete\ntest2\n'
      );

      expect(relations[0].fromOriginalRange).toEqual([1, 2]);
      expect(relations[0].toOriginalRange).toEqual([1, 3]);
    });

    fit('order should correct', async () => {
      const contents = {
        _originalFromContentRev: 'test1\ntest2\ntest3\ntest4\n',
        _modifiedFromContentRev: 'test1\ntest2\ntest3\ntest4\n',
        _originalToContentRev: 'test1\ntest2\ntest3\ntest4\n',
        _modifiedToContentRev: 'test1\ntest2\ntest3\ntest4\n',
      };

      const relationsWithContentInfo: IRawRelationWithContentInfo[] = [
        {
          id: 'second',
          fromPath: 'fromPath',
          toPath: 'toPath',
          fromRange: [3, 4],
          toRange: [3, 4],
          _originalFromContentRev: '_originalFromContentRev',
          _modifiedFromContentRev: '_modifiedFromContentRev',
          _originalToContentRev: '_originalToContentRev',
          _modifiedToContentRev: '_modifiedToContentRev',
        },
        {
          id: 'first',
          fromPath: 'fromPath',
          toPath: 'toPath',
          fromRange: [1, 2],
          toRange: [1, 2],
          _originalFromContentRev: '_originalFromContentRev',
          _modifiedFromContentRev: '_modifiedFromContentRev',
          _originalToContentRev: '_originalToContentRev',
          _modifiedToContentRev: '_modifiedToContentRev',
        },
      ];

      const relationsWithModifiedRange = await getRelationsWithModifiedRange({
        relationsWithContentInfo,
        contents,
      });

      const relationsWithOriginalContent = await getRelationsWithOriginalContent(
        {
          relationsWithModifiedRange,
          contents,
        }
      );

      const [relations] = relationsWithOriginalContent;

      expect(relations.find(d => d.id === 'first')?.fromOriginalRange).toEqual([
        1,
        2,
      ]);
      expect(
        relations.find(d => d.id === 'second')?.fromOriginalRange
      ).toEqual([4, 5]);
    });
  });
});
