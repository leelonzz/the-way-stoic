import { defineField, defineType } from 'sanity'

export const table = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'table',
      title: 'Table',
      type: 'portableTable',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption for the table',
    }),
  ],
  preview: {
    select: {
      table: 'table',
      caption: 'caption',
    },
    prepare({ table, caption }) {
      const rows = table?.rows?.length || 0
      const cols = table?.rows?.[0]?.cells?.length || 0
      return {
        title: caption || 'Table',
        subtitle: `${rows}×${cols} table`,
        media: () => '📊',
      }
    },
  },
})
