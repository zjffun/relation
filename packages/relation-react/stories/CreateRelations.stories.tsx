import { Meta, Story } from '@storybook/react';
import React from 'react';
import { CreateRelations } from '../src';
import { CreateRelationsProps } from '../src/CreateRelations';
import { RelationTypeEnum } from '../src/types';

const meta: Meta = {
  title: 'CreateRelations',
  component: CreateRelations,
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

const Template: Story<CreateRelationsProps> = args => {
  return (
    <main>
      <div style={{ height: '600px' }}>
        <CreateRelations {...args} />
      </div>
    </main>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  fromRev: 'HEAD',
  toRev: 'HEAD',
  fromContent: '1\n2\n3\n4\n5\n6\n7\n8\n9\n',
  toContent: '1\n2\n3\n4\n5\n6\n7\n8\n9\n',
  relations: [
    {
      id: '123',
      fromRange: [1, 2],
      toRange: [4, 5],
      type: RelationTypeEnum.relate,
    },
  ],
  onRelationsChange(d) {
    console.log('onRelationsChange', d);
  },
  onFromRevChange(d) {
    console.log('onFromRevChange', d);
  },
  onToRevChange(d) {
    console.log('onToRevChange', d);
  },
};
