/**
 * HTML to Sanity Portable Text Blocks Converter
 * Converts HTML content to Sanity CMS block format
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey() {
  return uuidv4().replace(/-/g, '').substring(0, 12);
}

/**
 * Parse HTML string and convert to Sanity blocks
 * @param {string} html - HTML content to convert
 * @returns {Array} Array of Sanity block objects
 */
export function htmlToSanityBlocks(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html.trim();

  const blocks = [];
  
  // Process each child element
  Array.from(tempDiv.children).forEach(element => {
    const block = processElement(element);
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block);
      } else {
        blocks.push(block);
      }
    }
  });

  return blocks;
}

/**
 * Process a single HTML element and convert to Sanity block
 * @param {HTMLElement} element - HTML element to process
 * @returns {Object|Array} Sanity block object or array of blocks
 */
function processElement(element) {
  const tagName = element.tagName.toLowerCase();

  // Handle images
  if (tagName === 'img') {
    return {
      _type: 'image',
      _key: generateKey(),
      asset: {
        _type: 'reference',
        _ref: element.src // You'll need to upload this to Sanity first
      },
      alt: element.alt || ''
    };
  }

  // Handle lists
  if (tagName === 'ul' || tagName === 'ol') {
    return processListElement(element, tagName === 'ul' ? 'bullet' : 'number');
  }

  // Handle block elements
  const style = getStyleFromTag(tagName);
  if (style) {
    return processBlockElement(element, style);
  }

  // Handle other elements as normal paragraphs
  return processBlockElement(element, 'normal');
}

/**
 * Get Sanity style from HTML tag
 * @param {string} tagName - HTML tag name
 * @returns {string} Sanity style name
 */
function getStyleFromTag(tagName) {
  const styleMap = {
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'p': 'normal',
    'blockquote': 'blockquote',
    'div': 'normal'
  };
  
  return styleMap[tagName] || 'normal';
}

/**
 * Process a block element (h1, h2, p, etc.)
 * @param {HTMLElement} element - HTML element
 * @param {string} style - Sanity style
 * @returns {Object} Sanity block object
 */
function processBlockElement(element, style) {
  const markDefs = [];
  const children = [];
  
  processTextNodes(element, children, markDefs);

  return {
    _type: 'block',
    _key: generateKey(),
    style: style,
    markDefs: markDefs,
    children: children
  };
}

/**
 * Process list element
 * @param {HTMLElement} listElement - UL or OL element
 * @param {string} listType - 'bullet' or 'number'
 * @returns {Array} Array of list item blocks
 */
function processListElement(listElement, listType) {
  const blocks = [];
  
  Array.from(listElement.children).forEach(li => {
    if (li.tagName.toLowerCase() === 'li') {
      const markDefs = [];
      const children = [];
      
      processTextNodes(li, children, markDefs);
      
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem: listType,
        markDefs: markDefs,
        children: children
      });
    }
  });
  
  return blocks;
}

/**
 * Process text nodes and inline elements within a block
 * @param {HTMLElement} element - Parent element
 * @param {Array} children - Array to store span children
 * @param {Array} markDefs - Array to store mark definitions
 */
function processTextNodes(element, children, markDefs) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  let currentText = '';
  const currentMarks = [];

  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text.trim()) {
        currentText += text;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      
      // Handle inline formatting
      if (['strong', 'b'].includes(tagName)) {
        currentMarks.push('strong');
      } else if (['em', 'i'].includes(tagName)) {
        currentMarks.push('em');
      } else if (tagName === 'code') {
        currentMarks.push('code');
      } else if (tagName === 'a') {
        const href = node.getAttribute('href');
        if (href) {
          const linkKey = generateKey();
          markDefs.push({
            _key: linkKey,
            _type: 'link',
            href: href
          });
          currentMarks.push(linkKey);
        }
      }
    }
  }

  // Create span for accumulated text
  if (currentText.trim()) {
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: currentText,
      marks: [...currentMarks]
    });
  }

  // If no text content, create empty span
  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: element.textContent || '',
      marks: []
    });
  }
}

/**
 * Convert array of HTML strings to Sanity blocks
 * @param {Array} htmlArray - Array of HTML strings
 * @returns {Array} Array of Sanity block objects
 */
export function htmlArrayToSanityBlocks(htmlArray) {
  if (!Array.isArray(htmlArray)) {
    return [];
  }

  const allBlocks = [];
  
  htmlArray.forEach(htmlString => {
    const blocks = htmlToSanityBlocks(htmlString);
    allBlocks.push(...blocks);
  });

  return allBlocks;
}

/**
 * Simple HTML string to single block converter (for basic text)
 * @param {string} html - HTML string
 * @param {string} style - Block style (default: 'normal')
 * @returns {Object} Single Sanity block
 */
export function simpleHtmlToBlock(html, style = 'normal') {
  // Strip HTML tags for simple text conversion
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  return {
    _type: 'block',
    _key: generateKey(),
    style: style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: text,
        marks: []
      }
    ]
  };
}

// Node.js compatible version (for server-side usage)
export function htmlToSanityBlocksNode(html) {
  if (typeof window === 'undefined') {
    // Server-side: Use a simple regex-based approach
    return htmlToSanityBlocksRegex(html);
  }
  
  return htmlToSanityBlocks(html);
}

/**
 * Regex-based HTML to Sanity blocks converter (for Node.js)
 * @param {string} html - HTML content
 * @returns {Array} Array of Sanity block objects
 */
function htmlToSanityBlocksRegex(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const blocks = [];
  
  // Simple regex patterns for common HTML elements
  const patterns = [
    { regex: /<h1[^>]*>(.*?)<\/h1>/gi, style: 'h1' },
    { regex: /<h2[^>]*>(.*?)<\/h2>/gi, style: 'h2' },
    { regex: /<h3[^>]*>(.*?)<\/h3>/gi, style: 'h3' },
    { regex: /<h4[^>]*>(.*?)<\/h4>/gi, style: 'h4' },
    { regex: /<p[^>]*>(.*?)<\/p>/gi, style: 'normal' },
    { regex: /<blockquote[^>]*>(.*?)<\/blockquote>/gi, style: 'blockquote' }
  ];

  const remainingHtml = html;
  
  patterns.forEach(({ regex, style }) => {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const content = match[1];
      const cleanText = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
      
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: style,
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: cleanText,
            marks: []
          }
        ]
      });
    }
  });

  return blocks;
}
