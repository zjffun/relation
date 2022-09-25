import React, { FC, useEffect, useState } from 'react';

import './index.scss';

export interface CreateModeProps {
  onCreate?: (ranges: {
    fromStartLine: number;
    fromEndLine: number;
    toStartLine: number;
    toEndLine: number;
  }) => void;
}

const CreateMode: FC<CreateModeProps> = ({ onCreate }) => {
  const [checked, setChecked] = useState(false);
  const [fromStartLine, setFromStartLine] = useState<number | undefined>();
  const [fromEndLine, setFromEndLine] = useState<number | undefined>();
  const [toStartLine, setToStartLine] = useState<number | undefined>();
  const [toEndLine, setToEndLine] = useState<number | undefined>();

  const submit = () => {
    if (
      fromStartLine === undefined ||
      fromEndLine === undefined ||
      toStartLine === undefined ||
      toEndLine === undefined
    ) {
      throw Error('submit fail');
    }
    onCreate?.({
      fromStartLine,
      fromEndLine,
      toStartLine,
      toEndLine,
    });
  };

  useEffect(() => {
    setFromStartLine(undefined);
    setFromEndLine(undefined);
    setToStartLine(undefined);
    setToEndLine(undefined);

    const listener = (event: any) => {
      if (!checked) {
        return;
      }
      setFromStartLine(event.detail.fromStartLine);
      setFromEndLine(event.detail.fromEndLine);
      setToStartLine(event.detail.toStartLine);
      setToEndLine(event.detail.toEndLine);
    };

    // TODO: multiple diff editor
    document.addEventListener('relationCreateRangeChange', listener);

    return () => {
      document.addEventListener('relationCreateRangeChange', listener);
    };
  }, [checked]);

  return (
    <span>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
        />
        Create Mode
      </label>
      {checked && fromStartLine && fromEndLine && toStartLine && toEndLine && (
        <span>
          L{fromStartLine},{fromEndLine}-L{toStartLine},{toEndLine}
          <button onClick={submit}>submit</button>
        </span>
      )}
    </span>
  );
};

export default CreateMode;
