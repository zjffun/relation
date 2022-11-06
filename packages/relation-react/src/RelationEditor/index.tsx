import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { IContents, IRawRelationWithContentInfo } from '../bundled';
import getRelation from '../getRelation';
import MonacoDiffEditorRelation, {
  IMonacoDiffEditorRelationRef,
} from '../MonacoDiffEditorRelation';
import { IRelation } from '../types';
import getRelationsWithModifiedRange from './getRelationsWithModifiedRange';
import getRelationsWithOriginalContent, {
  IRelationWithOriginalContentInfo,
} from './getRelationsWithOriginalContent';

export interface RelationEditorProps {
  contents: IContents;
  relationsWithContentInfo: IRawRelationWithContentInfo[];
  currentId?: string;
  options?: FC<any>;
  onFromSave?: (editor: monaco.editor.ICodeEditor) => void;
  onToSave?: (editor: monaco.editor.ICodeEditor) => void;
}

export interface IRelationEditorRef extends IMonacoDiffEditorRelationRef {
  relationsWithOriginalContent: IRelationWithOriginalContentInfo[];
}

const RelationEditor = forwardRef<IRelationEditorRef, RelationEditorProps>(
  (
    {
      contents,
      relationsWithContentInfo,
      currentId,
      options,
      onFromSave,
      onToSave,
    },
    ref
  ) => {
    const diffEditorRef = useRef<IMonacoDiffEditorRelationRef>(null);
    const [fromOriginal, setFromOriginal] = useState('');
    const [toOriginal, setToOriginal] = useState('');
    const [relations, setRelations] = useState<IRelation[]>([]);
    const [
      relationsWithOriginalContent,
      setRelationsWithOriginalContent,
    ] = useState<IRelationWithOriginalContentInfo[]>([]);

    let fromModifiedContent = '';
    let toModifiedContent = '';

    try {
      fromModifiedContent =
        contents[relationsWithContentInfo[0]._modifiedFromContentRev] || '';
      toModifiedContent =
        contents[relationsWithContentInfo[0]._modifiedToContentRev] || '';
    } catch (error) {
      console.error(error);
    }

    useImperativeHandle(
      ref,
      () => ({
        ...diffEditorRef,
        relationsWithOriginalContent,
      }),
      [diffEditorRef, relationsWithOriginalContent]
    );

    useEffect(() => {
      (async () => {
        const relationsWithModifiedRange = await getRelationsWithModifiedRange({
          relationsWithContentInfo,
          contents,
        });

        const [
          relationsWithOriginalContent,
          contentsAndOriginalContents,
        ] = getRelationsWithOriginalContent({
          relationsWithModifiedRange,
          contents,
        });

        setFromOriginal(contentsAndOriginalContents.fromOriginalContentRev);

        setToOriginal(contentsAndOriginalContents.toOriginalContentRev);

        setRelationsWithOriginalContent(relationsWithOriginalContent);
        const relations = relationsWithOriginalContent.map(getRelation);

        setRelations(relations);
      })();
    }, [contents, relationsWithContentInfo]);

    return (
      <MonacoDiffEditorRelation
        ref={diffEditorRef}
        fromOriginal={fromOriginal}
        fromModified={fromModifiedContent}
        toOriginal={toOriginal}
        toModified={toModifiedContent}
        relations={relations}
        currentId={currentId}
        options={options}
        onFromSave={onFromSave}
        onToSave={onToSave}
      />
    );
  }
);

export default RelationEditor;
