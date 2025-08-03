'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-stone hover:text-ink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ink mb-4">
              Privacy Policy
            </h1>
            <p className="text-stone text-lg">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Privacy Content */}
        <Card className="bg-white/50 backdrop-blur-sm border-stone/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-ink">
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-stone leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Account information (name, email address, password)</li>
                <li>Profile information and preferences</li>
                <li>Journal entries and personal reflections</li>
                <li>Usage data and interaction with our features</li>
                <li>Communication history with our support team</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                2. How We Use Your Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Deliver personalized stoic wisdom and quotes</li>
                <li>Enable journaling and reflection features</li>
                <li>Provide life calendar and memento mori insights</li>
                <li>Offer mentor chat functionality</li>
                <li>Track your progress and provide insights</li>
                <li>Respond to your questions and support requests</li>
                <li>Send important updates about our service</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                3. Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With trusted service providers who assist in operating our service</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                4. Data Security
              </h2>
              <p>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                5. Your Rights and Choices
              </h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Access and review your personal information</li>
                <li>Update or correct your account information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of certain communications</li>
                <li>Export your data in a portable format</li>
                <li>Request information about how we process your data</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                6. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie settings through your browser 
                preferences, though disabling certain cookies may affect service functionality.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                7. Third-Party Services
              </h2>
              <p>
                Our service may integrate with third-party services for authentication, analytics, and 
                payment processing. These services have their own privacy policies, and we encourage 
                you to review them. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                8. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to provide our services 
                and fulfill the purposes outlined in this policy. When you delete your account, we 
                will delete or anonymize your personal information, except where retention is required 
                for legal, security, or business purposes.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you believe we have collected 
                information from a child under 13, please contact us immediately.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                10. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance 
                with this privacy policy and applicable data protection laws.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                11. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. 
                Your continued use of our service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                12. Contact Information
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-stone/10 rounded-lg">
                <p className="font-medium text-ink">The Stoic Way</p>
                <p>Email: support@thewaystoic.site</p>
                <p>Website: www.thewaystoic.site</p>
              </div>
            </section>

            <Separator className="bg-stone/20" />

            <div className="text-center py-6">
              <p className="text-sm text-stone/70">
                &quot;The best revenge is not to be like your enemy.&quot; - Marcus Aurelius
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 