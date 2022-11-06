import getRelationsWithModifiedRange from '../../src/RelationEditor/getRelationsWithModifiedRange';

describe('RelationEditor', () => {
  describe('getRelationsWithModifiedRange', () => {
    it('Should work', async () => {
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
        contents: {
          _originalFromContentRev: 'test1\ntest2\n',
          _modifiedFromContentRev: 'test1\nadd\ntest2\n',
          _originalToContentRev: 'test1\nwill-delete\ntest2\n',
          _modifiedToContentRev: 'test1\ntest2\n',
        },
      });

      expect(relationsWithModifiedRange[0].fromModifiedRange).toEqual([1, 3]);
      expect(relationsWithModifiedRange[0].toModifiedRange).toEqual([1, 2]);
    });
  });
});
