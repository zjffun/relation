import { Meta, Story } from '@storybook/react';
import React, { useRef } from 'react';
import { getRelationByCheckResult, MonacoDiffEditorRelation } from '../src';
import { MonacoDiffEditorRelationProps } from '../src/MonacoDiffEditorRelation';
import {
  checkResults,
  originalAndModifiedContent,
} from './MonacoDiffEditorRelationData.json';

const meta: Meta = {
  title: 'MonacoDiffEditorRelation',
  component: MonacoDiffEditorRelation,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<MonacoDiffEditorRelationProps> = args => {
  const ref = useRef({});

  return (
    <div style={{ height: '600px' }}>
      <MonacoDiffEditorRelation ref={ref} {...args} />
    </div>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  fromOriginal: originalAndModifiedContent.fromOriginalContent,
  fromModified: originalAndModifiedContent.fromModifiedContent,
  toOriginal: originalAndModifiedContent.toOriginalContent,
  toModified: originalAndModifiedContent.toModifiedContent,
  relations: checkResults.map((d: any) => {
    return getRelationByCheckResult(d);
  }),
  options(data) {
    return <div onClick={() => console.log(data.id)}>test</div>;
  },
  onFromSave(editor) {
    console.log(editor);
  },
  onToSave(editor) {
    console.log(editor);
  },
};
