import { Meta, Story } from '@storybook/react';
import React from 'react';
import { UpdateRelation } from '../src';
import { UpdateRelationProps } from '../src/UpdateRelation';

const meta: Meta = {
  title: 'UpdateRelation',
  component: UpdateRelation,
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

const Template: Story<UpdateRelationProps> = args => {
  return (
    <main>
      <div style={{ height: '600px' }}>
        <UpdateRelation {...args} />
      </div>
    </main>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  fromRev: '1',
  fromRange: [2, 3],
  toRev: '1',
  toRange: [1, 3],
  fromOptions: [
    { rev: '1', label: 'f1', content: 'f1\n2\n3\n' },
    { rev: '2', label: 'f2', content: 'f4\n5\n6\n' },
  ],
  toOptions: [
    { rev: '1', label: 't1', content: 't1\n2\n3\n' },
    { rev: '2', label: 't2', content: 't4\n5\n6\n' },
  ],
  onFromRevChange(d) {
    console.log('onFromRevChange', d);
  },
  onFromRangeChange(d) {
    console.log('onFromRangeChange', d);
  },
  onToRevChange(d) {
    console.log('onToRevChange', d);
  },
  onToRangeChange(d) {
    console.log('onToRangeChange', d);
  },
};
