require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const { v4: uuidv4 } = require('uuid')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_READ_TOKEN, // Using read token for now, might work for creation too
  useCdn: false,
  apiVersion: '2024-01-01'
})

// Convert the content from the static page to portable text format
const blogPostContent = [
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'In our hyperconnected world, anxiety has become an unwelcome companion for millions. The constant stream of notifications, societal pressures, and uncertainty about the future can leave us feeling overwhelmed and powerless. Yet, over two thousand years ago, ancient philosophers developed a practical system for managing these very human struggles—a philosophy that remains remarkably relevant today.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Stoicism, founded in ancient Athens and refined by great minds like Marcus Aurelius, Seneca, and Epictetus, offers a powerful framework for understanding and managing anxiety. Unlike modern quick fixes or temporary solutions, Stoic philosophy addresses anxiety at its root by transforming how we perceive and respond to life\'s challenges.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'This comprehensive guide will introduce you to transformative daily Stoic quotes specifically chosen for their power to combat anxiety. You\'ll discover how these ancient insights can be practically applied to modern life, learn specific exercises to build mental resilience, and develop a sustainable approach to inner peace. By the end of this article, you\'ll possess a toolkit of Stoic wisdom that can help you navigate anxiety with greater clarity, courage, and calm.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Understanding Anxiety Through Stoic Philosophy'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Anxiety, from a Stoic perspective, stems from our misunderstanding of what we can and cannot control. The ancient Stoics identified this fundamental error in thinking as the root cause of most human suffering. When we worry about outcomes beyond our influence, other people\'s opinions, future events, or external circumstances, we create unnecessary mental turmoil.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'h3',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'The Dichotomy of Control'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"Some things are within our power, while others are not." — Epictetus'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Epictetus, who lived as a slave before becoming one of philosophy\'s greatest teachers, articulated this principle most clearly. This simple yet profound insight forms the foundation of Stoic anxiety management. Our thoughts, judgments, values, and responses are entirely within our control. Everything else—other people\'s actions, natural disasters, economic conditions, even our own mortality—lies outside our sphere of influence.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"Confine yourself to the present." — Marcus Aurelius'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Marcus Aurelius, writing in his personal journal that became the Meditations, frequently returned to this theme. As Roman Emperor, he faced immense pressures yet maintained inner peace by focusing solely on his own virtue and responses. His advice directly counters anxiety\'s tendency to project us into uncertain futures or trap us in regretful pasts.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Daily Stoic Quotes for Anxiety Relief'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"You have power over your mind—not outside events. Realize this, and you will find strength." — Marcus Aurelius'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'This fundamental Stoic principle directly addresses anxiety\'s core mechanism. When we feel anxious, we\'re typically focusing on external circumstances—a job interview, relationship conflict, or health concern. Marcus Aurelius reminds us that while we cannot control these external events, we possess complete authority over our mental responses.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Practical Application:',
        marks: ['strong']
      },
      {
        _type: 'span',
        _key: uuidv4(),
        text: ' When anxiety strikes, immediately ask yourself: "What aspect of this situation can I actually control?" Focus exclusively on your preparation, effort, and attitude. If you\'re nervous about a presentation, you cannot control the audience\'s reaction, but you can control your preparation level and delivery approach.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"Today I escaped anxiety. Or no, I discarded it, because it was within me, in my own perceptions—not outside." — Marcus Aurelius'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'This quote reveals anxiety\'s true nature: it\'s not imposed by external circumstances but generated by our internal interpretations. Marcus Aurelius uses the word "discarded" deliberately—anxiety is something we can choose to release, not an inevitable response to challenging situations.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"Don\'t demand that things happen as you wish—wish that they happen as they do happen, and you will go on well." — Epictetus'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'Epictetus, speaking from experience as someone who endured slavery and physical disability, offers profound wisdom about acceptance. This isn\'t passive resignation but active alignment with reality. Fighting against what has already occurred or demanding specific outcomes creates the mental friction we experience as anxiety.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: '"We suffer more often in imagination than in reality." — Seneca'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'This insightful observation addresses anxiety\'s tendency toward catastrophic thinking. Seneca recognized that we often torture ourselves with imagined disasters that never materialize. Our mental rehearsals of worst-case scenarios create real suffering over fictional events.'
      }
    ]
  },
  {
    _type: 'block',
    _key: uuidv4(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4(),
        text: 'When caught in anxious thoughts about future scenarios, ask: "Is this actually happening now, or am I suffering over something imagined?" Return attention to present reality and current opportunities for virtuous action.'
      }
    ]
  }
]

const blogPost = {
  _type: 'blogPost',
  title: 'Daily Stoic Quotes for Anxiety Relief',
  slug: {
    _type: 'slug',
    current: 'daily-stoic-quotes-for-anxiety'
  },
  author: 'Editorial Team',
  excerpt: 'Discover daily Stoic quotes for anxiety designed to calm modern stress. Learn how ancient Stoic philosophy helps manage anxiety and find inner peace. Start transforming worry today.',
  mainImage: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-mountain-landscape'
    },
    alt: 'Serene mountain landscape at sunrise representing inner peace and Stoic philosophy for anxiety relief'
  },
  categories: ['Philosophy', 'Self-Improvement'],
  tags: ['Stoicism', 'Ancient Philosophy', 'Resilience', 'Mental Toughness', 'Self-Discipline', 'Emotional Intelligence', 'Mindfulness', 'Personal Growth', 'Stoic Principles', 'Stoic Exercises'],
  publishedAt: new Date('2025-01-15').toISOString(),
  body: blogPostContent,
  featured: true,
  seo: {
    metaTitle: 'Daily Stoic Quotes for Anxiety Relief',
    metaDescription: 'Discover daily Stoic quotes for anxiety. Learn how ancient Stoic philosophy helps manage stress and find peace. Transform your anxiety with timeless wisdom today.'
  }
}

async function createBlogPost() {
  try {
    console.log('Creating blog post in Sanity...')
    const result = await client.create(blogPost)
    console.log('Blog post created successfully:', result._id)
    console.log('You can now view it at: http://localhost:3001/blog/daily-stoic-quotes-for-anxiety')
  } catch (error) {
    console.error('Error creating blog post:', error)
  }
}

createBlogPost()