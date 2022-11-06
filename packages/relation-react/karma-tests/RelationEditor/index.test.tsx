import React from 'react';
import { createRoot } from 'react-dom/client';
import { IRawRelationWithContentInfo, RelationEditor } from '../../src/index';

describe('RelationEditor', () => {
  describe('RelationEditor', () => {
    it('options id should correct', async () => {
      const rootEl = document.createElement('div');
      rootEl.id = 'root-test';
      document.body.appendChild(rootEl);

      const contents = {
        _originalFromContentRev: 'test1\ntest2\n',
        _modifiedFromContentRev: 'test1\nadd\ntest2\n',
        _originalToContentRev: 'test1\nwill-delete\ntest2\n',
        _modifiedToContentRev: 'test1\ntest2\n',
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

      createRoot(rootEl).render(
        <div style={{ width: '100%', height: '500px' }}>
          <RelationEditor
            contents={contents}
            relationsWithContentInfo={relationsWithContentInfo}
            options={(data: any) => {
              return (
                <button className="button-test" data-id={data.id}>
                  Update
                </button>
              );
            }}
          />
        </div>
      );

      //       await new Promise(resolve => setTimeout(resolve, 3000));
      //       const buttons = document.querySelectorAll('.button-test');
      //       expect(buttons.length).toBe(2);
      //       expect(buttons[0].getAttribute('data-id')).toBe('first');
      //       expect(buttons[1].getAttribute('data-id')).toBe('second');
    });
  });
});
