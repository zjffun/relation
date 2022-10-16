import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import RelationSvg from '../MonacoDiffEditorRelation/RelationSvg';
import { RelationTypeEnum } from '../types';

import createEditor from './createEditor';
import './index.scss';

export interface UpdateRelationOption {
  label: string;
  rev: string;
  content: string;
  range?: [number, number];
}

export interface UpdateRelationProps {
  fromRev: string;
  fromRange: [number, number];
  toRev: string;
  toRange: [number, number];
  fromOptions: UpdateRelationOption[];
  toOptions: UpdateRelationOption[];
  onFromRevChange?: (rev: string) => void;
  onFromRangeChange?: (range: [number, number]) => void;
  onToRevChange?: (rev: string) => void;
  onToRangeChange?: (editor: [number, number]) => void;
}

export interface UpdateRelationRef {
  layout: () => void;
}

const UpdateRelation = forwardRef<UpdateRelationRef, UpdateRelationProps>(
  (
    {
      fromRev,
      fromRange,
      toRev,
      toRange,
      fromOptions,
      toOptions,
      onFromRevChange,
      onFromRangeChange,
      onToRevChange,
      onToRangeChange,
    },
    ref
  ) => {
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

    useImperativeHandle(
      ref,
      () => ({
        layout: () => {
          fromEditorRef.current?.layout();
          toEditorRef.current?.layout();
        },
      }),
      []
    );

    useEffect(() => {
      fromEditorRef.current = createEditor(fromEditorElRef.current);
      toEditorRef.current = createEditor(toEditorElRef.current);
    }, []);

    useEffect(() => {
      fromEditorRef.current?.setValue(
        fromOptions.find(o => o.rev === fromRev)?.content || ''
      );
    }, [fromRev]);

    useEffect(() => {
      toEditorRef.current?.setValue(
        toOptions.find(o => o.rev === toRev)?.content || ''
      );
    }, [toRev]);

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
        }
      );
    }, []);

    useEffect(() => {
      relationSvgRef.current?.setRelations([
        {
          fromRange: fromRange,
          toRange: toRange,
          type: RelationTypeEnum.relate,
        },
      ]);
      relationSvgRef.current?.renderLinks();
    }, [fromRange, toRange]);

    return (
      <div className="UpdateRelation">
        <div className="UpdateRelation__FormContainer">
          <div className="UpdateRelation__Form">
            <div className="UpdateRelation__Form__Item">
              Revision:
              <ul className="UpdateRelation__Options">
                {fromOptions.map(option => {
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
            <div className="UpdateRelation__Form__Item">
              Range: L
              <input
                type="number"
                onChange={e => {
                  onFromRangeChange?.([Number(e.target.value), fromRange?.[1]]);
                }}
                value={fromRange?.[0]}
              />
              -L
              <input
                type="number"
                onChange={e => {
                  onFromRangeChange?.([fromRange?.[0], Number(e.target.value)]);
                }}
                value={fromRange?.[1]}
              />
            </div>
          </div>
          <div className="UpdateRelation__Form">
            <div className="UpdateRelation__Form__Item">
              Revision:
              <ul className="UpdateRelation__Options">
                {toOptions.map(option => {
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
            <div className="UpdateRelation__Form__Item">
              Range: L
              <input
                type="number"
                onChange={e => {
                  onToRangeChange?.([Number(e.target.value), toRange?.[1]]);
                }}
                value={toRange?.[0]}
              />
              -L
              <input
                type="number"
                onChange={e => {
                  onToRangeChange?.([toRange?.[0], Number(e.target.value)]);
                }}
                value={toRange?.[1]}
              />
            </div>
          </div>
        </div>
        <div className="UpdateRelation__RelationContainer">
          <div className="UpdateRelation__EditorContainer">
            <div className="UpdateRelation__Editor" ref={fromEditorElRef}></div>
            <div className="UpdateRelation__Editor" ref={toEditorElRef}></div>
          </div>
          <svg
            className="UpdateRelation__RelationSvg"
            ref={relationSvgElRef}
          ></svg>
        </div>
      </div>
    );
  }
);

export default UpdateRelation;
