'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {autoImageUploadPlugin} from './plugins/auto-image-upload'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_READ_TOKEN,
  plugins: [
    structureTool(),
    visionTool(),
    // autoImageUploadPlugin(), // Temporarily disabled for debugging
  ],
  schema: {
    types: [
      {
        name: 'blogPost',
        title: 'Blog Post',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'author',
            title: 'Author',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 3,
          },
          {
            name: 'mainImage',
            title: 'Main Image',
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
          },
          {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{type: 'string'}],
          },
          {
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{type: 'string'}],
          },
          {
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'body',
            title: 'Body',
            type: 'array',
            components: {
              input: () => import('../src/components/sanity/MarkdownBodyInput').then(mod => ({ default: mod.MarkdownBodyInput })),
            },
            of: [
              {
                type: 'block',
                styles: [
                  {title: 'Normal', value: 'normal'},
                  {title: 'H1', value: 'h1'},
                  {title: 'H2', value: 'h2'},
                  {title: 'H3', value: 'h3'},
                  {title: 'H4', value: 'h4'},
                  {title: 'Quote', value: 'blockquote'},
                ],
                marks: {
                  decorators: [
                    {title: 'Strong', value: 'strong'},
                    {title: 'Emphasis', value: 'em'},
                    {title: 'Code', value: 'code'},
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
                options: {hotspot: true},
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
            name: 'featured',
            title: 'Featured Post',
            type: 'boolean',
            description: 'Mark this post as featured',
          },
          {
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
          },
        ],
        preview: {
          select: {
            title: 'title',
            author: 'author',
            media: 'mainImage',
          },
          prepare(selection) {
            const {author} = selection
            return Object.assign({}, selection, {
              subtitle: author && `by ${author}`,
            })
          },
        },
      },
      {
        name: 'course',
        title: 'Course',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Course Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'description',
            title: 'Course Description',
            type: 'text',
            rows: 4,
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'shortDescription',
            title: 'Short Description',
            type: 'text',
            rows: 2,
            description: 'Brief summary for course cards',
          },
          {
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
          },
          {
            name: 'instructor',
            title: 'Instructor',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'instructorBio',
            title: 'Instructor Bio',
            type: 'text',
            rows: 3,
          },
          {
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
          },
          {
            name: 'duration',
            title: 'Course Duration',
            type: 'string',
            description: 'e.g., "4 weeks", "12 hours", "Self-paced"',
          },
          {
            name: 'difficulty',
            title: 'Difficulty Level',
            type: 'string',
            options: {
              list: [
                {title: 'Beginner', value: 'beginner'},
                {title: 'Intermediate', value: 'intermediate'},
                {title: 'Advanced', value: 'advanced'},
              ],
            },
          },
          {
            name: 'price',
            title: 'Price',
            type: 'number',
            description: 'Course price in USD (0 for free)',
          },
          {
            name: 'currency',
            title: 'Currency',
            type: 'string',
            initialValue: 'USD',
            options: {
              list: [
                {title: 'USD', value: 'USD'},
                {title: 'EUR', value: 'EUR'},
                {title: 'GBP', value: 'GBP'},
              ],
            },
          },
          {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{type: 'string'}],
          },
          {
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{type: 'string'}],
          },
          {
            name: 'lessons',
            title: 'Lessons',
            type: 'array',
            of: [
              {
                type: 'object',
                fields: [
                  {
                    name: 'title',
                    title: 'Lesson Title',
                    type: 'string',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'description',
                    title: 'Lesson Description',
                    type: 'text',
                    rows: 2,
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
                    title: 'Lesson Content',
                    type: 'array',
                    of: [
                      {
                        type: 'block',
                        styles: [
                          {title: 'Normal', value: 'normal'},
                          {title: 'H3', value: 'h3'},
                          {title: 'H4', value: 'h4'},
                          {title: 'Quote', value: 'blockquote'},
                        ],
                        marks: {
                          decorators: [
                            {title: 'Strong', value: 'strong'},
                            {title: 'Emphasis', value: 'em'},
                            {title: 'Code', value: 'code'},
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
                    ],
                  },
                  {
                    name: 'resources',
                    title: 'Lesson Resources',
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
                                {title: 'PDF', value: 'pdf'},
                                {title: 'Link', value: 'link'},
                                {title: 'Download', value: 'download'},
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
                    description: 'Allow free access to this lesson',
                  },
                ],
                preview: {
                  select: {
                    title: 'title',
                    duration: 'duration',
                  },
                  prepare(selection) {
                    const {title, duration} = selection
                    return {
                      title,
                      subtitle: duration ? `Duration: ${duration}` : 'No duration set',
                    }
                  },
                },
              },
            ],
          },
          {
            name: 'prerequisites',
            title: 'Prerequisites',
            type: 'array',
            of: [{type: 'string'}],
            description: 'What students should know before taking this course',
          },
          {
            name: 'learningOutcomes',
            title: 'Learning Outcomes',
            type: 'array',
            of: [{type: 'string'}],
            description: 'What students will learn from this course',
          },
          {
            name: 'featured',
            title: 'Featured Course',
            type: 'boolean',
            description: 'Mark this course as featured',
          },
          {
            name: 'published',
            title: 'Published',
            type: 'boolean',
            description: 'Course is live and available for enrollment',
            initialValue: false,
          },
          {
            name: 'publishedAt',
            title: 'Published Date',
            type: 'datetime',
          },
          {
            name: 'enrollmentCount',
            title: 'Enrollment Count',
            type: 'number',
            description: 'Number of students enrolled',
            initialValue: 0,
          },
          {
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
          },
        ],
        preview: {
          select: {
            title: 'title',
            instructor: 'instructor',
            media: 'featuredImage',
            price: 'price',
          },
          prepare(selection) {
            const {title, instructor, price} = selection
            return Object.assign({}, selection, {
              subtitle: `${instructor} ${price ? `• $${price}` : '• Free'}`,
            })
          },
        },
      },
    ],
  },
})