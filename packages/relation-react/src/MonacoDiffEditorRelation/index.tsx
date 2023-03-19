import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { IRelation } from '../types';
import createDiffEditor from './createDiffEditor';
import RelationSvg from './RelationSvg';
import setModelToDiffEditor from './setModelToDiffEditor';
import { throttle } from 'lodash-es';

import './index.scss';

export interface IMonacoDiffEditorRelationProps {
  fromOriginal: string;
  fromModified: string;
  toOriginal: string;
  toModified: string;
  relations: IRelation[];
  currentId?: string;
  options?: FC<any>;
  onFromSave?: (editor: monaco.editor.ICodeEditor) => void;
  onToSave?: (editor: monaco.editor.ICodeEditor) => void;
}

export interface IMonacoDiffEditorRelationRef {
  diffEditorRef?: any;
}

const MonacoDiffEditorRelation = forwardRef<
  IMonacoDiffEditorRelationRef,
  IMonacoDiffEditorRelationProps
>(
  (
    {
      fromOriginal,
      fromModified,
      toOriginal,
      toModified,
      relations,
      currentId,
      options,
      onFromSave,
      onToSave,
    },
    ref
  ) => {
    const fromDiffEditorElRef = useRef<HTMLDivElement>(null);
    const toDiffEditorElRef = useRef<HTMLDivElement>(null);
    const relationSvgElRef = useRef<SVGSVGElement>(null);

    const diffEditorRef = useRef<
      [
        monaco.editor.IStandaloneDiffEditor | null,
        monaco.editor.IStandaloneDiffEditor | null
      ]
    >([null, null]);

    const monacoRelationView = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        diffEditorRef,
      }),
      [diffEditorRef]
    );

    useEffect(() => {
      const resize = throttle(() => {
        if (diffEditorRef.current[0]) {
          diffEditorRef.current[0].layout();
        }

        if (diffEditorRef.current[1]) {
          diffEditorRef.current[1].layout();
        }

        if (monacoRelationView.current) {
          monacoRelationView.current.resize();
        }
      }, 500);

      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
      };
    }, []);

    useEffect(() => {
      // Will created double in `<React.StrictMode>`, if not check.
      if (!diffEditorRef.current[0]) {
        diffEditorRef.current[0] = createDiffEditor(
          fromDiffEditorElRef.current,
          {
            saveHandler: onFromSave,
          }
        );
      }

      // Will created double in `<React.StrictMode>`, if not check.
      if (!diffEditorRef.current[1]) {
        diffEditorRef.current[1] = createDiffEditor(toDiffEditorElRef.current, {
          saveHandler: onToSave,
        });
      }

      if (
        !relationSvgElRef.current ||
        !diffEditorRef.current[0] ||
        !diffEditorRef.current[1]
      ) {
        return;
      }

      monacoRelationView.current = new RelationSvg(
        diffEditorRef.current[0],
        diffEditorRef.current[1],
        relations,
        relationSvgElRef.current,
        {
          fromContainerDomNode: diffEditorRef.current[0]!.getContainerDomNode(),
          toContainerDomNode: diffEditorRef.current[1]!.getContainerDomNode(),
          options,
        }
      );

      if (currentId) {
        monacoRelationView.current.scrollToRelation(currentId);
      }
    }, []);

    useEffect(() => {
      (async () => {
        await setModelToDiffEditor(
          diffEditorRef.current[0],
          fromOriginal,
          fromModified
        );

        await setModelToDiffEditor(
          diffEditorRef.current[1],
          toOriginal,
          toModified
        );

        monacoRelationView.current.setRelations(relations);
      })();
    }, [fromOriginal, fromModified, toOriginal, toModified, relations]);

    return (
      <div className="MonacoDiffEditorRelation">
        <div className="MonacoDiffEditorRelation__EditorList">
          <div
            className="MonacoDiffEditorRelation__EditorList__Item"
            ref={fromDiffEditorElRef}
          ></div>
          <div
            className="MonacoDiffEditorRelation__EditorList__Item"
            ref={toDiffEditorElRef}
          ></div>
        </div>
        <svg
          className="MonacoDiffEditorRelation__RelationSvg"
          ref={relationSvgElRef}
        ></svg>
      </div>
    );
  }
);

export default MonacoDiffEditorRelation;
