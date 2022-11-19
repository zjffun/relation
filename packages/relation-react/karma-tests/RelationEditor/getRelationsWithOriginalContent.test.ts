import { IViewerRelation } from '../../src';
import getRelationsWithModifiedRange from '../../src/RelationEditor/getRelationsWithModifiedRange';
import getRelationsWithOriginalContents from '../../src/RelationEditor/getRelationsWithOriginalContents';

describe('RelationEditor', () => {
  describe('getRelationsWithOriginalContent', () => {
    it('should work', async () => {
      const viewerContents = {
        originalFromViewerContentRev: 'test1\ntest2\n',
        _modifiedFromContentRev: 'test1\nadd\ntest2\n',
        originalToViewerContentRev: 'test1\nwill-delete\ntest2\n',
        _modifiedToContentRev: 'test1\ntest2\n',
      };
      const relationsWithModifiedRange = await getRelationsWithModifiedRange({
        viewerRelations: [
          {
            id: '0',
            fromRange: [1, 2],
            toRange: [1, 3],
            originalFromViewerContentRev: 'originalFromViewerContentRev',
            originalToViewerContentRev: 'originalToViewerContentRev',
          },
        ],
        viewerContents,
        fromModifiedContent: viewerContents._modifiedFromContentRev,
        toModifiedContent: viewerContents._modifiedToContentRev,
      });

      const relationsWithOriginalContent = await getRelationsWithOriginalContents(
        {
          relationsWithModifiedRange,
          viewerContents,
          fromModifiedContent: viewerContents._modifiedFromContentRev,
          toModifiedContent: viewerContents._modifiedToContentRev,
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
      const viewerContents = {
        originalFromViewerContentRev: 'test1\ntest2\ntest3\ntest4\n',
        _modifiedFromContentRev: 'test1\ntest2\ntest3\ntest4\n',
        originalToViewerContentRev: 'test1\ntest2\ntest3\ntest4\n',
        _modifiedToContentRev: 'test1\ntest2\ntest3\ntest4\n',
      };

      const viewerRelations: IViewerRelation[] = [
        {
          id: 'second',
          fromRange: [3, 4],
          toRange: [3, 4],
          originalFromViewerContentRev: 'originalFromViewerContentRev',
          originalToViewerContentRev: 'originalToViewerContentRev',
        },
        {
          id: 'first',
          fromRange: [1, 2],
          toRange: [1, 2],
          originalFromViewerContentRev: 'originalFromViewerContentRev',
          originalToViewerContentRev: 'originalToViewerContentRev',
        },
      ];

      const relationsWithModifiedRange = await getRelationsWithModifiedRange({
        viewerRelations,
        viewerContents,
        fromModifiedContent: viewerContents._modifiedFromContentRev,
        toModifiedContent: viewerContents._modifiedToContentRev,
      });

      const relationsWithOriginalContent = await getRelationsWithOriginalContents(
        {
          relationsWithModifiedRange,
          viewerContents,
          fromModifiedContent: viewerContents._modifiedFromContentRev,
          toModifiedContent: viewerContents._modifiedToContentRev,
        }
      );

      const [relations] = relationsWithOriginalContent;

      expect(relations.find(d => d.id === 'first')?.fromOriginalRange).toEqual([
        1,
        2,
      ]);
      expect(
        relations.find(d => d.id === 'second')?.fromOriginalRange
      ).toEqual([3, 4]);
    });
  });
});
