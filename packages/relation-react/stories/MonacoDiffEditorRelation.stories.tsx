import { Meta, Story } from '@storybook/react';
import React, { useRef } from 'react';
import { MonacoDiffEditorRelation } from '../src';
import { IMonacoDiffEditorRelationProps } from '../src/MonacoDiffEditorRelation';

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

const Template: Story<IMonacoDiffEditorRelationProps> = args => {
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
  fromOriginal: '1\n2\n3\n',
  fromModified: '1\n2\n3\n',
  toOriginal: '1\n2\n3\n',
  toModified: '1\n2\n3\n',
  relations: [],
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

/*
TODO: fix scroll without original
Default.args = {
  fromOriginal: '',
  fromModified: '1\n2\n3\n',
  toOriginal: '',
  toModified: '1\n2\n3\n',
  relations: [],
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
 */
