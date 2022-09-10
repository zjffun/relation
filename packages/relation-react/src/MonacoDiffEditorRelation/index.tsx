import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { FC, useEffect, useRef } from 'react';
import { IRelation } from '../types';
import createDiffEditor from './createDiffEditor';
import RelationSvg from './RelationSvg';
import setModelToDiffEditor from './setModelToDiffEditor';

import './index.scss';

export interface MonacoDiffEditorRelationProps {
  fromOriginal: string;
  fromModified: string;
  toOriginal: string;
  toModified: string;
  relations: IRelation[];
  currentId?: string;
  options?: FC<any>;
}

const MonacoDiffEditorRelation: FC<MonacoDiffEditorRelationProps> = ({
  fromOriginal,
  fromModified,
  toOriginal,
  toModified,
  relations,
  currentId,
  options,
}) => {
  const fromDiffEditorElRef = useRef<HTMLDivElement>(null);
  const toDiffEditorElRef = useRef<HTMLDivElement>(null);
  const relationSvgElRef = useRef<SVGSVGElement>(null);

  const diffEditorRef = useRef<
    [
      monaco.editor.IStandaloneDiffEditor | null,
      monaco.editor.IStandaloneDiffEditor | null
    ]
  >([null, null]);

  useEffect(() => {
    diffEditorRef.current[0] = createDiffEditor(fromDiffEditorElRef.current);
    diffEditorRef.current[1] = createDiffEditor(toDiffEditorElRef.current);
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

      if (!relationSvgElRef.current) {
        return;
      }

      const monacoRelationView = new RelationSvg(
        diffEditorRef.current[0]!.getModifiedEditor(),
        diffEditorRef.current[1]!.getModifiedEditor(),
        relations,
        relationSvgElRef.current,
        {
          fromContainerDomNode: diffEditorRef.current[0]!.getContainerDomNode(),
          toContainerDomNode: diffEditorRef.current[1]!.getContainerDomNode(),
          options,
        }
      );

      if (currentId) {
        monacoRelationView.scrollToRelation(currentId);
      }
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
};

export default MonacoDiffEditorRelation;
