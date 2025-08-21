import { defineField, defineType } from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Course Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Course Description',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief summary for course cards',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
    }),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'instructorBio',
      title: 'Instructor Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'instructorImage',
      title: 'Instructor Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Course Duration',
      type: 'string',
      description: 'e.g., "4 weeks", "12 hours", "Self-paced"',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
      },
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Course price in USD (0 for free)',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
      options: {
        list: [
          { title: 'USD', value: 'USD' },
          { title: 'EUR', value: 'EUR' },
          { title: 'GBP', value: 'GBP' },
        ],
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Chapter',
          fields: [
            {
              name: 'title',
              title: 'Chapter Title',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Chapter order in course',
            },
            {
              name: 'modules',
              title: 'Modules',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: 'Module',
                  fields: [
                    {
                      name: 'title',
                      title: 'Module Title',
                      type: 'string',
                      validation: Rule => Rule.required(),
                    },
                    {
                      name: 'description',
                      title: 'Module Description',
                      type: 'text',
                      rows: 2,
                    },
                    {
                      name: 'order',
                      title: 'Order',
                      type: 'number',
                      description: 'Module order in chapter',
                    },
                    {
                      name: 'duration',
                      title: 'Duration',
                      type: 'string',
                      description: 'e.g., "15 min", "1 hour"',
                    },
                    {
                      name: 'videoUrl',
                      title: 'Video URL',
                      type: 'url',
                      description: 'YouTube, Vimeo, or direct video URL',
                    },
                    {
                      name: 'content',
                      title: 'Module Content',
                      type: 'array',
                      of: [
                        {
                          type: 'block',
                          styles: [
                            { title: 'Normal', value: 'normal' },
                            { title: 'H3', value: 'h3' },
                            { title: 'H4', value: 'h4' },
                            { title: 'Quote', value: 'blockquote' },
                          ],
                          marks: {
                            decorators: [
                              { title: 'Strong', value: 'strong' },
                              { title: 'Emphasis', value: 'em' },
                              { title: 'Code', value: 'code' },
                            ],
                            annotations: [
                              {
                                title: 'URL',
                                name: 'link',
                                type: 'object',
                                fields: [
                                  {
                                    title: 'URL',
                                    name: 'href',
                                    type: 'url',
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        {
                          type: 'image',
                          options: { hotspot: true },
                          fields: [
                            {
                              name: 'alt',
                              type: 'string',
                              title: 'Alt text',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'resources',
                      title: 'Resources',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            {
                              name: 'title',
                              title: 'Resource Title',
                              type: 'string',
                            },
                            {
                              name: 'url',
                              title: 'Resource URL',
                              type: 'url',
                            },
                            {
                              name: 'type',
                              title: 'Resource Type',
                              type: 'string',
                              options: {
                                list: [
                                  { title: 'PDF', value: 'pdf' },
                                  { title: 'Link', value: 'link' },
                                  { title: 'Download', value: 'download' },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'exercises',
                      title: 'Exercises',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            {
                              name: 'title',
                              title: 'Exercise Title',
                              type: 'string',
                            },
                            {
                              name: 'instructions',
                              title: 'Instructions',
                              type: 'text',
                              rows: 3,
                            },
                            {
                              name: 'type',
                              title: 'Exercise Type',
                              type: 'string',
                              options: {
                                list: [
                                  { title: 'Reflection', value: 'reflection' },
                                  { title: 'Writing', value: 'writing' },
                                  { title: 'Practice', value: 'practice' },
                                  { title: 'Quiz', value: 'quiz' },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'isFree',
                      title: 'Free Preview',
                      type: 'boolean',
                      description: 'Allow free access to this module',
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      duration: 'duration',
                    },
                    prepare(selection) {
                      const { title, duration } = selection
                      return {
                        title,
                        subtitle: duration
                          ? `Duration: ${duration}`
                          : 'No duration set',
                      }
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              order: 'order',
            },
            prepare(selection) {
              const { title, order } = selection
              return {
                title,
                subtitle: order ? `Chapter ${order}` : 'No order set',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What students should know before taking this course',
    }),
    defineField({
      name: 'learningOutcomes',
      title: 'Learning Outcomes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What students will learn from this course',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Course',
      type: 'boolean',
      description: 'Mark this course as featured',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Course is live and available for enrollment',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'enrollmentCount',
      title: 'Enrollment Count',
      type: 'number',
      description: 'Number of students enrolled',
      initialValue: 0,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      instructor: 'instructor',
      media: 'featuredImage',
      price: 'price',
    },
    prepare(selection) {
      const { title, instructor, price } = selection
      return Object.assign({}, selection, {
        subtitle: `${instructor} ${price ? `• $${price}` : '• Free'}`,
      })
    },
  },
})
