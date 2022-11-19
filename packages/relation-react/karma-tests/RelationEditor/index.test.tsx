import React from 'react';
import { createRoot } from 'react-dom/client';
import { IRelationViewerData, RelationEditor } from '../../src/index';

describe('RelationEditor', () => {
  describe('RelationEditor', () => {
    it('options id should correct', async () => {
      const rootEl = document.createElement('div');
      rootEl.id = 'root-test';
      document.body.appendChild(rootEl);

      const viewerContents = {
        originalFromViewerContentRev: 'test1\ntest2\n',
        _modifiedFromContentRev: 'test1\nadd\ntest2\n',
        originalToViewerContentRev: 'test1\nwill-delete\ntest2\n',
        _modifiedToContentRev: 'test1\ntest2\n',
      };

      const relationViewerData: IRelationViewerData = {
        fromPath: 'fromPath',
        toPath: 'toPath',
        fromModifiedContent: viewerContents._modifiedFromContentRev,
        toModifiedContent: viewerContents._modifiedToContentRev,
        viewerRelations: [
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
        ],

        viewerContents,
      };

      createRoot(rootEl).render(
        <div style={{ width: '100%', height: '500px' }}>
          <RelationEditor
            relationViewerData={relationViewerData}
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
