import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { IRelationViewerData } from '../bundled';
import getRelation from '../getRelation';
import MonacoDiffEditorRelation, {
  IMonacoDiffEditorRelationRef,
} from '../MonacoDiffEditorRelation';
import { IRelation } from '../types';
import getRelationsWithModifiedRange from './getRelationsWithModifiedRange';
import getRelationsWithOriginalContents, {
  IRelationWithOriginalContentInfo,
} from './getRelationsWithOriginalContents';

export interface RelationEditorProps {
  relationViewerData: IRelationViewerData;
  currentId?: string;
  options?: FC<any>;
  onFromSave?: (editor: monaco.editor.ICodeEditor) => void;
  onToSave?: (editor: monaco.editor.ICodeEditor) => void;
}

export interface IRelationEditorRef extends IMonacoDiffEditorRelationRef {
  relationsWithOriginalContent: IRelationWithOriginalContentInfo[];
}

const RelationEditor = forwardRef<IRelationEditorRef, RelationEditorProps>(
  ({ relationViewerData, currentId, options, onFromSave, onToSave }, ref) => {
    if (!relationViewerData) {
      return null;
    }

    const {
      viewerContents,
      viewerRelations,
      fromModifiedContent,
      toModifiedContent,
    } = relationViewerData;

    const diffEditorRef = useRef<IMonacoDiffEditorRelationRef>(null);
    const [fromOriginal, setFromOriginal] = useState('');
    const [toOriginal, setToOriginal] = useState('');
    const [relations, setRelations] = useState<IRelation[]>([]);
    const [
      relationsWithOriginalContent,
      setRelationsWithOriginalContent,
    ] = useState<IRelationWithOriginalContentInfo[]>([]);

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
        const relationsWithModifiedRange = await getRelationsWithModifiedRange(
          relationViewerData
        );

        const [
          relationsWithOriginalContent,
          contentsAndOriginalContents,
        ] = getRelationsWithOriginalContents({
          relationsWithModifiedRange,
          viewerContents,
          fromModifiedContent,
          toModifiedContent,
        });

        setFromOriginal(contentsAndOriginalContents.fromOriginalContentRev);

        setToOriginal(contentsAndOriginalContents.toOriginalContentRev);

        setRelationsWithOriginalContent(relationsWithOriginalContent);
        const relations = relationsWithOriginalContent.map(getRelation);

        setRelations(relations);
      })();
    }, [viewerContents, viewerRelations]);

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
