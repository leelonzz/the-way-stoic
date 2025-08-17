# Testing Guide for Real-Time HTML Editor

## Manual Testing Steps

### 1. Access Sanity Studio
1. Navigate to `http://localhost:3001/studio`
2. Sign in to your Sanity account
3. Go to "Blog Post" content type
4. Create a new blog post or edit an existing one

### 2. Test Auto-Conversion Feature

#### Enable Auto-Conversion
1. Locate the "Content Body" section
2. Ensure the "Auto-convert" toggle is ON (lightning bolt icon should be visible)
3. Type the following HTML in the editor:

```html
<h1>Test Title</h1>
<p>This is a <strong>bold</strong> paragraph with <em>italic</em> text.</p>
```

4. **Expected Result**: 
   - Content should automatically convert to Portable Text after 500ms
   - Preview tab should show both HTML and converted content
   - "Live conversion" badge should appear

#### Disable Auto-Conversion
1. Turn OFF the "Auto-convert" toggle
2. Type more HTML content
3. Click "Convert to Rich Text" button manually
4. **Expected Result**: Conversion only happens when button is clicked

### 3. Test Live Preview

#### HTML Preview
1. Switch to "Preview" tab
2. Type HTML in the editor
3. **Expected Result**: 
   - Left panel shows rendered HTML immediately
   - Right panel shows converted Portable Text structure

#### Real-time Updates
1. With auto-conversion enabled, type:
```html
<h2>Dynamic Content</h2>
<blockquote>This should update in real-time</blockquote>
<code>console.log('test')</code>
```

2. **Expected Result**: Both previews update as you type

### 4. Test Error Handling

#### Invalid HTML
1. Type malformed HTML:
```html
<h1>Unclosed header
<p>Missing closing tag
```

2. **Expected Result**: Error message should appear

#### Empty Content
1. Clear all content
2. Click "Convert to Rich Text"
3. **Expected Result**: "Please enter some HTML to convert" error

### 5. Test Supported HTML Tags

Try each of these HTML structures:

#### Headers
```html
<h1>Header 1</h1>
<h2>Header 2</h2>
<h3>Header 3</h3>
<h4>Header 4</h4>
```

#### Text Formatting
```html
<p>Normal paragraph</p>
<strong>Bold text</strong>
<em>Italic text</em>
<code>Inline code</code>
```

#### Lists
```html
<ul>
  <li>Unordered item 1</li>
  <li>Unordered item 2</li>
</ul>

<ol>
  <li>Ordered item 1</li>
  <li>Ordered item 2</li>
</ol>
```

#### Blockquotes
```html
<blockquote>
  This is a blockquote for emphasis
</blockquote>
```

#### Code Blocks
```html
<pre><code>function test() {
  return "Hello World";
}</code></pre>
```

#### Links
```html
<a href="https://example.com">External Link</a>
```

### 6. Test Performance

#### Debouncing
1. Enable auto-conversion
2. Type rapidly in the editor
3. **Expected Result**: 
   - Conversion should not happen on every keystroke
   - Should wait 500ms after stopping typing
   - No performance lag or freezing

#### Large Content
1. Paste a large HTML document (1000+ lines)
2. **Expected Result**: 
   - Should handle large content gracefully
   - Preview should scroll properly
   - No browser freezing

### 7. Test UI Components

#### Badges
- "HTML detected" badge appears when valid HTML is present
- Block count badge shows number of converted blocks
- "Live conversion" badge appears when auto-convert is enabled

#### Tabs
- "HTML Editor" tab shows the input area
- "Preview" tab shows dual preview panels
- Switching between tabs preserves content

#### Buttons
- "Convert to Rich Text" button works when auto-convert is disabled
- "Clear All Content" button removes all content and resets state

## Automated Testing

### Unit Tests (Future Implementation)

Create tests for:

```typescript
// Test debounced conversion
describe('debouncedAutoConvert', () => {
  it('should debounce rapid changes', async () => {
    // Test implementation
  })
})

// Test HTML validation
describe('isValidHtml', () => {
  it('should detect valid HTML tags', () => {
    expect(isValidHtml('<h1>Title</h1>')).toBe(true)
    expect(isValidHtml('Plain text')).toBe(false)
  })
})

// Test conversion
describe('htmlToPortableText', () => {
  it('should convert HTML to Portable Text blocks', () => {
    const html = '<h1>Title</h1><p>Content</p>'
    const blocks = htmlToPortableText(html)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].style).toBe('h1')
  })
})
```

### Integration Tests

Test the complete workflow:

```typescript
describe('HtmlBodyInput Integration', () => {
  it('should handle complete editing workflow', async () => {
    // 1. Render component
    // 2. Enable auto-conversion
    // 3. Type HTML
    // 4. Verify conversion
    // 5. Check preview updates
  })
})
```

## Browser Compatibility

Test in these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Testing

Test responsive behavior:
- Tablet view (768px+)
- Mobile view (320px+)
- Touch interactions
- Virtual keyboard behavior

## Performance Benchmarks

Monitor these metrics:
- Initial load time
- Conversion speed for large documents
- Memory usage during extended editing
- Preview rendering performance

## Common Issues and Solutions

### Issue: Auto-conversion not working
**Solution**: Check browser console for JavaScript errors

### Issue: Preview not updating
**Solution**: Verify HTML validity and check debounce timing

### Issue: Performance lag
**Solution**: Reduce debounce delay or optimize conversion logic

### Issue: Mobile layout issues
**Solution**: Test responsive CSS and touch interactions

## Success Criteria

The component passes testing if:

1. ✅ Auto-conversion works reliably with 500ms debounce
2. ✅ Live preview updates in real-time
3. ✅ All supported HTML tags convert correctly
4. ✅ Error handling works for invalid input
5. ✅ UI components respond correctly
6. ✅ Performance remains smooth with large content
7. ✅ Mobile experience is usable
8. ✅ No console errors or warnings
9. ✅ Content persists correctly in Sanity
10. ✅ Conversion accuracy matches expectations

## Reporting Issues

When reporting issues, include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- HTML content that caused the issue
- Screenshots or screen recordings
