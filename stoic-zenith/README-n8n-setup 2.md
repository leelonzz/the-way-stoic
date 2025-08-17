# n8n Google Docs to Sanity Blog Post Automation

This n8n workflow automatically transforms Google Docs content into SEO-optimized blog posts in your Sanity CMS using AI-powered content generation.

## 🚀 Workflow Overview

The workflow performs the following steps:
1. **Webhook Trigger** - Receives document ID and starts the workflow
2. **Google Docs** - Fetches the document content from Google Docs
3. **Extract Content** - Processes and cleans the document text
4. **AI SEO Generator** - Uses OpenAI to generate SEO metadata (title, description, tags, categories)
5. **Format for Sanity** - Transforms content to Sanity's Portable Text format
6. **Create Sanity Blog Post** - Posts the blog post to your Sanity dataset
7. **Process Result** - Returns success/error response with URLs

## 📋 Prerequisites

### Required API Keys & Credentials:
- **Google Docs API** access (OAuth2)
- **OpenAI API key** (GPT-4 recommended)
- **Sanity Write Token** (Editor permissions)

### Environment Variables:
```bash
SANITY_PROJECT_ID=uw2gxwzi
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_API_WRITE_TOKEN=your_write_token_here
```

## ⚙️ Setup Instructions

### 1. Import Workflow

1. Open your n8n instance
2. Click **"+"** to create new workflow
3. Click **"Import from JSON"**
4. Paste the contents of `n8n-workflow-google-docs-to-sanity.json`
5. Save the workflow

### 2. Configure Credentials

#### Google Docs OAuth2:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Google Docs API**
4. Create **OAuth2 credentials**
5. In n8n: **Credentials** → **Add** → **Google Docs OAuth2**
6. Enter your credentials and authorize

#### OpenAI API:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In n8n: **Credentials** → **Add** → **OpenAI**
3. Enter your API key

#### Sanity API Auth:
1. Create a **Write Token** in your Sanity project:
   - Go to [sanity.io](https://sanity.io) → Your Project → API → Tokens
   - Click **"Add API token"**
   - Name: `n8n-automation`
   - Permissions: **Editor**
   - Copy the token
2. In n8n: **Credentials** → **Add** → **HTTP Header Auth**
3. Name: `Sanity API Auth`
4. Header Name: `Authorization`
5. Header Value: `Bearer YOUR_SANITY_TOKEN_HERE`

### 3. Update Node Credentials

Update these credential IDs in the workflow nodes:
- **Google Docs node**: Replace `your-google-docs-credential-id`
- **AI SEO Generator node**: Replace `your-openai-credential-id`  
- **Create Sanity Blog Post node**: Replace `your-sanity-auth-credential-id`

### 4. Configure Environment Variables

In your n8n instance, set these environment variables:
```bash
SANITY_PROJECT_ID=uw2gxwzi
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_API_WRITE_TOKEN=your_write_token_here
```

## 🔧 Usage

### Method 1: Webhook Trigger (Recommended)

1. **Activate** the workflow in n8n
2. Copy the webhook URL (will be displayed in the Webhook node)
3. Make a POST request to trigger the workflow:

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "1BvAI8txvyrp3t6mOyj-caRRT9BPHt0bG-Rj2E8Mi78w"
  }'
```

### Method 2: Manual Execution

1. Open the workflow in n8n
2. Click **"Execute Workflow"**
3. The workflow will use the default document ID specified in the Google Docs node

### Method 3: Integration with External Apps

You can trigger this workflow from:
- **Zapier** (using webhooks)
- **Google Apps Script** (trigger when document is updated)
- **Browser bookmarklet** (quick trigger from any Google Doc)
- **Your application** (programmatic integration)

## 📝 Google Docs Content Structure

For best results, structure your Google Docs as follows:

```
Document Title (becomes the base for SEO title)

Introduction paragraph with key points...

## Main Heading 1
Content for this section...

## Main Heading 2  
More content here...

### Subheading
Detailed information...

## Conclusion
Wrap up your points...
```

### Tips for Better AI SEO Generation:
- **Include keywords** naturally in your content
- **Write clear headings** that reflect the content structure
- **Add relevant quotes** or references to Stoic philosophers
- **Focus on practical applications** of Stoic principles
- **Target 800-2000 words** for optimal SEO

## 🎯 Customization Options

### Modify AI Prompt for SEO:
Edit the **AI SEO Generator** node prompt to:
- Change tone or style
- Adjust category options
- Modify tag suggestions
- Update character limits

### Adjust Content Processing:
Modify the **Extract Content** node to:
- Handle different document structures
- Extract images or tables
- Process custom formatting

### Change Sanity Schema:
Update the **Format for Sanity** node if your blog post schema differs:
- Add/remove fields
- Change field names
- Adjust data types

## 🔍 Troubleshooting

### Common Issues:

**1. Google Docs Authentication Failed**
- Verify OAuth2 credentials are correct
- Check Google Cloud Console permissions
- Re-authorize if credentials expired

**2. OpenAI API Rate Limits**
- Check your OpenAI usage limits
- Consider adding delays between requests
- Use GPT-3.5 instead of GPT-4 for faster processing

**3. Sanity API Errors**
- Verify write token has correct permissions
- Check project ID and dataset name
- Ensure schema matches the data being sent

**4. Webhook Not Triggering**
- Verify webhook URL is correct and active
- Check n8n instance is running and accessible
- Confirm JSON payload format

### Debug Mode:
Enable debug mode in n8n to see:
- Raw responses from each node
- Error messages and stack traces
- Data transformations between nodes

## 📊 Expected Output

Successful execution returns:
```json
{
  "success": true,
  "message": "Blog post created successfully!",
  "documentId": "blogPost_abc123",
  "title": "Daily Stoic Quotes for Anxiety: Ancient Wisdom for Modern Peace",
  "slug": "daily-stoic-quotes-anxiety-ancient-wisdom-modern-peace",
  "publishedAt": "2024-01-01T12:00:00.000Z",
  "studioUrl": "https://uw2gxwzi.sanity.studio/structure/blogPost;blogPost_abc123",
  "blogUrl": "https://your-domain.com/blog/daily-stoic-quotes-anxiety-ancient-wisdom-modern-peace",
  "suggestedFeaturedImage": "Ancient Greek philosopher statue with modern anxiety relief elements"
}
```

## 🚀 Advanced Features

### Batch Processing:
- Modify workflow to accept multiple document IDs
- Add loop logic for bulk processing
- Implement rate limiting and error handling

### Image Processing:
- Extract images from Google Docs
- Upload to Sanity's asset management
- Generate alt text using AI

### Content Scheduling:
- Add date/time scheduling
- Implement draft vs. published logic
- Set up automated publishing workflows

### Quality Assurance:
- Add content validation steps
- Implement approval workflows
- Create automatic backup processes

## 📞 Support

For issues with:
- **n8n workflow**: Check n8n community forums
- **Sanity integration**: Visit Sanity documentation
- **Google Docs API**: Check Google Cloud documentation
- **OpenAI API**: Visit OpenAI platform docs

Remember to check API rate limits and ensure all credentials have appropriate permissions!