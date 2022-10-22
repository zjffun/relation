import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { relationId } from '../bundled';
import RelationSvg from '../MonacoDiffEditorRelation/RelationSvg';
import { IRelation, RelationTypeEnum } from '../types';

import createEditor from './createEditor';
import './index.scss';

export interface CreateRelationsProps {
  fromRev: string;
  toRev: string;
  fromContent: string;
  toContent: string;
  relations: IRelation[];
  onRelationsChange?: (relations: IRelation[]) => void;
  onFromRevChange?: (rev: string) => void;
  onToRevChange?: (rev: string) => void;
}

export interface ICreateRelationsRef {
  layout: () => void;
}

export interface ICommonRef {
  relations: IRelation[];
  onRelationsChange?: (relations: IRelation[]) => void;
  setFromRange: (range: [number, number]) => void;
  setToRange: (range: [number, number]) => void;
}

const options = [
  {
    label: 'HEAD',
    rev: 'HEAD',
  },
  {
    label: 'Current content',
    rev: '',
  },
];

const CreateRelations = forwardRef<ICreateRelationsRef, CreateRelationsProps>(
  (
    {
      fromRev,
      toRev,
      fromContent,
      toContent,
      relations,
      onRelationsChange,
      onFromRevChange,
      onToRevChange,
    },
    ref
  ) => {
    const [fromRange, setFromRange] = useState<[number, number]>([0, 0]);
    const [toRange, setToRange] = useState<[number, number]>([0, 0]);
    const fromEditorElRef = useRef<HTMLDivElement>(null);
    const toEditorElRef = useRef<HTMLDivElement>(null);
    const relationSvgElRef = useRef<SVGSVGElement>(null);
    const fromEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
      null
    );
    const toEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
      null
    );
    const relationSvgRef = useRef<RelationSvg | null>(null);
    const commonRef = useRef<ICommonRef>({
      relations,
      onRelationsChange,
      setFromRange,
      setToRange,
    });

    const addRelation = () => {
      onRelationsChange?.([
        ...relations,
        {
          id: relationId(),
          fromRange,
          toRange,
          type: RelationTypeEnum.relate,
        },
      ]);
    };

    useImperativeHandle(ref, () => ({
      layout: () => {
        fromEditorRef.current?.layout();
        toEditorRef.current?.layout();
      },
    }));

    useEffect(() => {
      commonRef.current = {
        relations,
        onRelationsChange,
        setFromRange,
        setToRange,
      };
    }, [relations, onRelationsChange, setFromRange, setToRange]);

    useEffect(() => {
      fromEditorRef.current = createEditor(fromEditorElRef.current);
      toEditorRef.current = createEditor(toEditorElRef.current);
    }, []);

    useEffect(() => {
      const onDidChangeCursorSelection = () => {
        if (!fromEditorRef.current || !toEditorRef.current) {
          return;
        }
        const fromSelection = fromEditorRef.current.getSelection();
        const toSelection = toEditorRef.current.getSelection();
        const fromStartLine = fromSelection!.getStartPosition().lineNumber;
        const fromEndLine = fromSelection!.getEndPosition().lineNumber;
        const toStartLine = toSelection!.getStartPosition().lineNumber;
        const toEndLine = toSelection!.getEndPosition().lineNumber;

        commonRef.current.setFromRange([fromStartLine, fromEndLine]);
        commonRef.current.setToRange([toStartLine, toEndLine]);
      };

      const fromDisposable = fromEditorRef.current?.onDidChangeCursorSelection(
        onDidChangeCursorSelection
      );
      const toDisposable = toEditorRef.current?.onDidChangeCursorSelection(
        onDidChangeCursorSelection
      );

      return () => {
        fromDisposable?.dispose();
        toDisposable?.dispose();
      };
    }, []);

    useEffect(() => {
      fromEditorRef.current?.setValue(fromContent);
    }, [fromContent]);

    useEffect(() => {
      toEditorRef.current?.setValue(toContent);
    }, [toContent]);

    useEffect(() => {
      if (!relationSvgElRef.current) return;

      relationSvgRef.current = new RelationSvg(
        {
          getOriginalEditor() {
            return fromEditorRef.current;
          },
          getModifiedEditor() {
            return fromEditorRef.current;
          },
        } as any,
        {
          getOriginalEditor() {
            return toEditorRef.current;
          },
          getModifiedEditor() {
            return toEditorRef.current;
          },
        } as any,
        [],
        relationSvgElRef.current,
        {
          fromContainerDomNode: fromEditorRef.current!.getContainerDomNode(),
          toContainerDomNode: toEditorRef.current!.getContainerDomNode(),
          options({ id, type }) {
            if (type === RelationTypeEnum.temp) {
              return null;
            }
            return (
              <button
                onClick={() => {
                  commonRef.current?.onRelationsChange?.(
                    commonRef.current.relations.filter(d => d.id !== id)
                  );
                }}
              >
                Delete
              </button>
            );
          },
        }
      );
    }, []);

    useEffect(() => {
      const relationsWithAdding = [
        ...relations,
        { fromRange, toRange, type: RelationTypeEnum.temp },
      ];
      relationSvgRef.current?.setRelations(relationsWithAdding);
      relationSvgRef.current?.renderLinks();
    }, [relations, fromRange, toRange]);

    return (
      <div className="CreateRelations">
        <div className="CreateRelations__FormContainer">
          <div className="CreateRelations__Form">
            <div className="CreateRelations__Form__Item">
              Revision:
              <ul className="CreateRelations__Options">
                {options.map(option => {
                  return (
                    <li key={option.rev}>
                      <label>
                        <input
                          type="radio"
                          onChange={() => {
                            onFromRevChange?.(option.rev);
                          }}
                          name="fromRev"
                          value={option.rev}
                          checked={fromRev === option.rev}
                        />
                        {option.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="CreateRelations__Form">
            <div className="CreateRelations__Form__Item">
              Revision:
              <ul className="CreateRelations__Options">
                {options.map(option => {
                  return (
                    <li key={option.rev}>
                      <label>
                        <input
                          type="radio"
                          onChange={() => {
                            onToRevChange?.(option.rev);
                          }}
                          name="toRev"
                          value={option.rev}
                          checked={toRev === option.rev}
                        />
                        {option.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="CreateRelations__AddRelation">
          From L
          <input
            type="number"
            onChange={e => {
              setFromRange?.([Number(e.target.value), fromRange?.[1]]);
            }}
            value={fromRange?.[0]}
          />
          -L
          <input
            type="number"
            onChange={e => {
              setFromRange?.([fromRange?.[0], Number(e.target.value)]);
            }}
            value={fromRange?.[1]}
          />
          to L
          <input
            type="number"
            onChange={e => {
              setToRange?.([Number(e.target.value), toRange?.[1]]);
            }}
            value={toRange?.[0]}
          />
          -L
          <input
            type="number"
            onChange={e => {
              setToRange?.([toRange?.[0], Number(e.target.value)]);
            }}
            value={toRange?.[1]}
          />
          <button onClick={addRelation}>Add</button>
        </div>
        <div className="CreateRelations__RelationContainer">
          <div className="CreateRelations__EditorContainer">
            <div
              className="CreateRelations__Editor"
              ref={fromEditorElRef}
            ></div>
            <div className="CreateRelations__Editor" ref={toEditorElRef}></div>
          </div>
          <svg
            className="CreateRelations__RelationSvg"
            ref={relationSvgElRef}
          ></svg>
        </div>
      </div>
    );
  }
);

export default CreateRelations;
