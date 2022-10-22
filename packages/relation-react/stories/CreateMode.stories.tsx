import { Meta, Story } from '@storybook/react';
import React, { useRef } from 'react';
import { CreateMode, MonacoDiffEditorRelation } from '../src';
import { CreateModeProps } from '../src/CreateMode';

const meta: Meta = {
  title: 'CreateMode',
  component: CreateMode,
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

const Template: Story<CreateModeProps> = args => {
  const ref = useRef({});

  return (
    <main>
      <div>
        <CreateMode {...args} />
      </div>
      <div style={{ height: '600px' }}>
        <MonacoDiffEditorRelation
          ref={ref}
          {...{
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
          }}
        />
      </div>
    </main>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  onCreate: data => {
    console.log(data);
  },
};
