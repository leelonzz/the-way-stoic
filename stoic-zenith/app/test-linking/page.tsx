import { PortableText } from '@/components/PortableText'
import { LinkingConsistencyTester } from '@/components/LinkingConsistencyTester'

// Test content with philosopher names
const testContent = [
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Marcus Aurelius was a Roman emperor and Stoic philosopher. He wrote his famous Meditations while campaigning. Seneca taught about virtue and wisdom, while Epictetus emphasized the dichotomy of control. These Stoic principles help us manage our emotions and live according to nature.'
      }
    ]
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Zeno of Citium founded Stoicism in ancient Athens. Musonius Rufus was known as the teacher of Epictetus. Cato the Younger exemplified Stoic virtue through his actions.'
      }
    ]
  }
]

export default function TestLinkingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Internal Linking System Test
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test Content with Automatic Linking
              </h2>
              <div className="prose max-w-none">
                <PortableText
                  value={testContent}
                  enableInternalLinking={true}
                  linkingContext={{ type: 'blog-to-biography' }}
                  pageId="test-linking-page"
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Expected Links
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Marcus Aurelius</strong> → /biography/marcus-aurelius</li>
                <li>• <strong>Seneca</strong> → /biography/seneca</li>
                <li>• <strong>Epictetus</strong> → /biography/epictetus</li>
                <li>• <strong>Zeno of Citium</strong> → /biography/zeno-of-citium</li>
                <li>• <strong>Musonius Rufus</strong> → /biography/musonius-rufus</li>
                <li>• <strong>Cato the Younger</strong> → /biography/cato-the-younger</li>
                <li>• <strong>Stoicism</strong> → /blog/stoicism-complete-guide</li>
                <li>• <strong>dichotomy of control</strong> → /blog/stoicism-complete-guide</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Testing Instructions</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Refresh this page multiple times (Ctrl+R or Cmd+R)</li>
                <li>2. Check that the same links appear consistently</li>
                <li>3. Verify that philosopher names are linked to their biography pages</li>
                <li>4. Confirm that Stoic concepts link to the main guide</li>
                <li>5. Run the consistency tests below for detailed analysis</li>
                <li>6. Check browser console for debug logs</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Current Status</h3>
              <p className="text-sm text-green-800">
                ✅ Fixed: Removed useEffect complexity that was causing state conflicts<br/>
                ✅ Fixed: Reset linking state on every render for consistency<br/>
                ✅ Fixed: Use consistent pageId across all text spans<br/>
                ✅ Added: Debug logging to track linking behavior<br/>
                🔄 Page loaded at: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
        
        <LinkingConsistencyTester />
      </div>
    </div>
  )
}
