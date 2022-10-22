import { Meta, Story } from '@storybook/react';
import React, { useRef } from 'react';
import { RelationEditor } from '../src';
import { RelationEditorProps } from '../src/RelationEditor';
import {
  fromPath,
  fromBaseDir,
  toPath,
  toBaseDir,
  checkResults,
  fileContents,
} from './RelationEditorData.json';

const meta: Meta = {
  title: 'RelationEditor',
  component: RelationEditor,
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

const Template: Story<RelationEditorProps> = args => {
  const ref = useRef({});

  return (
    <div style={{ height: '600px' }}>
      <RelationEditor ref={ref} {...args} />
    </div>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  fromPath,
  fromBaseDir,
  toPath,
  toBaseDir,
  checkResults,
  fileContents,
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
