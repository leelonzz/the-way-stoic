import { type SchemaTypeDefinition } from 'sanity'
import { blogPost } from './blogPost'
import { course } from './course'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blogPost, course],
}
