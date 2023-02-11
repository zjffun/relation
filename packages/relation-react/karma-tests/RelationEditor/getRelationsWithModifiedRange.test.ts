import getRelationsWithModifiedRange from '../../src/RelationEditor/getRelationsWithModifiedRange';

describe('RelationEditor', () => {
  describe('getRelationsWithModifiedRange', () => {
    it('should work', async () => {
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
        viewerContents: {
          originalFromViewerContentRev: 'test1\ntest2\n',
          originalToViewerContentRev: 'test1\nwill-delete\ntest2\n',
        },
        fromModifiedContent: 'test1\nadd\ntest2\n',
        toModifiedContent: 'test1\ntest2\n',
      });

      expect(relationsWithModifiedRange[0].fromModifiedRange).toEqual([1, 3]);
      expect(relationsWithModifiedRange[0].toModifiedRange).toEqual([1, 2]);
      expect(relationsWithModifiedRange[0].dirty).toEqual(true);
    });
  });
});
