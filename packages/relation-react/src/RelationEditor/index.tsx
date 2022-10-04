import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { FC, forwardRef, useEffect, useState } from 'react';
import {
  ICheckResultView,
  IOriginalAndModifiedContentResult,
} from 'relation2-core';
import { join, split } from 'split-split';
import getRelationByCheckResult from '../getRelationByCheckResult';
import MonacoDiffEditorRelation from '../MonacoDiffEditorRelation';
import createDiffEditor from '../MonacoDiffEditorRelation/createDiffEditor';
import setModelToDiffEditor from '../MonacoDiffEditorRelation/setModelToDiffEditor';
import { IRelation } from '../types';

export interface RelationEditorProps {
  originalAndModifiedContent: IOriginalAndModifiedContentResult;
  checkResults: ICheckResultView[];
  currentId?: string;
  options?: FC<any>;
  onFromSave?: (editor: monaco.editor.ICodeEditor) => void;
  onToSave?: (editor: monaco.editor.ICodeEditor) => void;
}

const getLineNum = (content: string) => {
  return content.split('\n').length;
};

const getContentByRange = (content: string, range: [number, number]) => {
  if (range[0] > range[1]) {
    return '';
  }

  const [substrings, separators] = split(content, ['\r\n', '\n']);
  let result = join(
    substrings.slice(range[0] - 1, range[1]),
    separators.slice(range[0] - 1, range[1] - 1)
  );
  if (separators[range[1] - 1]) {
    result += separators[range[1] - 1];
  }
  return result;
};

const getRangeLineCount = (range: [number, number]) => {
  if (range[0] > range[1]) {
    return 0;
  }
  return range[1] - range[0] + 1;
};

const getContent = async ({
  rangeInfos,
  originalContents,
  modifiedContent,
  originalRangeName,
}: {
  rangeInfos: {
    modifiedRange: [number, number];
    rev: string;
    range: [number, number];
    checkResult: any;
  }[];
  originalContents: { [key: string]: string };
  modifiedContent: string;
  originalRangeName: string;
}) => {
  const contents = [];
  let lineNum = 1;

  rangeInfos.sort((a, b) => a.modifiedRange[0] - b.modifiedRange[0]);

  for (let i = 0; i < rangeInfos.length; i++) {
    const range = rangeInfos[i];

    const content = originalContents[range.rev];

    /**
     * --- lines ---
     * first relation start
     */
    if (i === 0 && range.modifiedRange[0] > 1) {
      const tempRange: [number, number] = [1, range.modifiedRange[0] - 1];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }

    /**
     * relation start
     * --- lines ---
     * relation end
     */
    contents.push(getContentByRange(content, range.range));
    const tempLineNum: number = lineNum + getRangeLineCount(range.range);
    range.checkResult[originalRangeName] = [lineNum, tempLineNum - 1];
    // console.log(getContentByRange(content, range.range), lineNum, tempLineNum);
    lineNum = tempLineNum;

    /**
     * relation end
     * --- lines ---
     * next relation start
     */
    if (i + 1 < rangeInfos.length) {
      const nextRange = rangeInfos[i + 1];

      const tempRange: [number, number] = [
        range.modifiedRange[1] + 1,
        nextRange.modifiedRange[0] - 1,
      ];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
      // console.log(getContentByRange(modifiedContent, tempRange), tempRange);
    }

    /**
     * last relation end
     * --- lines ---
     */
    if (i + 1 === rangeInfos.length) {
      const end = getLineNum(modifiedContent);

      const tempRange: [number, number] = [range.modifiedRange[1] + 1, end];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }
  }

  return contents.join('');
};

const RelationEditor = forwardRef<{ diffEditorRef?: any }, RelationEditorProps>(
  (
    {
      originalAndModifiedContent,
      checkResults,
      currentId,
      options,
      onFromSave,
      onToSave,
    },
    ref
  ) => {
    const [fromOriginal, setFromOriginal] = useState('');
    const [toOriginal, setToOriginal] = useState('');
    const [relations, setRelations] = useState<IRelation[]>([]);

    useEffect(() => {
      (async () => {
        const fromDiffEditor = createDiffEditor(document.createElement('div'));
        const toDiffEditor = createDiffEditor(document.createElement('div'));
        let lastFromRev = '';
        let lastToRev = '';

        for (const checkResult of checkResults) {
          if (checkResult.fromRev !== lastFromRev) {
            await setModelToDiffEditor(
              fromDiffEditor,
              originalAndModifiedContent.fromOriginalContents[
                checkResult.fromRev
              ],
              originalAndModifiedContent.fromModifiedContent
            );
            lastFromRev = checkResult.fromRev;
          }

          checkResult.fromModifiedRange = [
            fromDiffEditor?.getDiffLineInformationForOriginal(
              checkResult.fromRange[0]
            )?.equivalentLineNumber || 0,
            fromDiffEditor?.getDiffLineInformationForOriginal(
              checkResult.fromRange[1]
            )?.equivalentLineNumber || 0,
          ];

          if (checkResult.toRev !== lastToRev) {
            await setModelToDiffEditor(
              toDiffEditor,
              originalAndModifiedContent.toOriginalContents[checkResult.toRev],
              originalAndModifiedContent.toModifiedContent
            );
            lastToRev = checkResult.toRev;
          }

          checkResult.toModifiedRange = [
            toDiffEditor?.getDiffLineInformationForOriginal(
              checkResult.toRange[0]
            )?.equivalentLineNumber || 0,
            toDiffEditor?.getDiffLineInformationForOriginal(
              checkResult.toRange[1]
            )?.equivalentLineNumber || 0,
          ];
        }

        setFromOriginal(
          await getContent({
            rangeInfos: checkResults.map(checkResult => ({
              modifiedRange: checkResult.fromModifiedRange,
              rev: checkResult.fromRev,
              range: checkResult.fromRange,
              checkResult,
            })),
            originalContents: originalAndModifiedContent.fromOriginalContents,
            modifiedContent: originalAndModifiedContent.fromModifiedContent,
            originalRangeName: 'fromOriginalRange',
          })
        );

        setToOriginal(
          await getContent({
            rangeInfos: checkResults.map(checkResult => ({
              modifiedRange: checkResult.toModifiedRange,
              rev: checkResult.toRev,
              range: checkResult.toRange,
              checkResult,
            })),
            originalContents: originalAndModifiedContent.toOriginalContents,
            modifiedContent: originalAndModifiedContent.toModifiedContent,
            originalRangeName: 'toOriginalRange',
          })
        );

        setRelations(
          checkResults.map(checkResults =>
            getRelationByCheckResult(checkResults)
          )
        );
      })();
    }, [originalAndModifiedContent, checkResults]);

    return (
      <MonacoDiffEditorRelation
        ref={ref}
        fromOriginal={fromOriginal}
        fromModified={originalAndModifiedContent.fromModifiedContent}
        toOriginal={toOriginal}
        toModified={originalAndModifiedContent.toModifiedContent}
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
