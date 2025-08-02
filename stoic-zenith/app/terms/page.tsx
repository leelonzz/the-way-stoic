'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function TermsPage(): JSX.Element {
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
              Terms of Service
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

        {/* Terms Content */}
        <Card className="bg-white/50 backdrop-blur-sm border-stone/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-ink">
              Welcome to The Stoic Way
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-stone leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using The Stoic Way application, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                2. Description of Service
              </h2>
              <p>
                The Stoic Way is a digital platform designed to help users
                practice Stoic philosophy through daily quotes, journaling, life
                calendar visualization, and guided reflection. Our service
                includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Daily Stoic wisdom and quotes</li>
                <li>Personal journaling tools</li>
                <li>Life calendar and memento mori features</li>
                <li>Mentor chat functionality</li>
                <li>Progress tracking and insights</li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                3. User Accounts and Privacy
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account information and for all activities that occur under your
                account. We are committed to protecting your privacy and will
                handle your personal data in accordance with our Privacy Policy.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                4. Acceptable Use
              </h2>
              <p>
                You agree to use The Stoic Way for lawful purposes only and in a
                way that does not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Infringe the rights of others</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>
                  Use the service for commercial purposes without permission
                </li>
              </ul>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                5. Intellectual Property
              </h2>
              <p>
                The Stoic Way and its original content, features, and
                functionality are owned by us and are protected by international
                copyright, trademark, patent, trade secret, and other
                intellectual property laws. Ancient Stoic texts and quotes are
                in the public domain, but our presentation and organization are
                protected.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                6. User-Generated Content
              </h2>
              <p>
                You retain ownership of any content you create within the app
                (such as journal entries). By using our service, you grant us a
                limited license to store and display your content as part of the
                service. You are responsible for ensuring you have the right to
                share any content you post.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                7. Disclaimers
              </h2>
              <p>
                The Stoic Way is provided &ldquo;as is&rdquo; without warranties
                of any kind. We do not guarantee that the service will be
                uninterrupted, secure, or error-free. The philosophical content
                is for educational and personal development purposes and should
                not replace professional mental health advice.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                8. Limitation of Liability
              </h2>
              <p>
                In no event shall The Stoic Way be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses, resulting from your use of
                the service.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                9. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes by posting the new terms on
                this page and updating the &ldquo;Last updated&rdquo; date. Your
                continued use of the service after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <Separator className="bg-stone/20" />

            <section>
              <h2 className="text-xl font-semibold text-ink mb-3">
                10. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="mt-2 p-4 bg-stone/10 rounded-lg">
                <p className="font-medium text-ink">The Stoic Way</p>
                <p>Email: support@thestoicway.com</p>
                <p>Website: www.thestoicway.com</p>
              </div>
            </section>

            <Separator className="bg-stone/20" />

            <div className="text-center py-6">
              <p className="text-sm text-stone/70">
                &ldquo;The happiness of your life depends upon the quality of
                your thoughts.&rdquo; - Marcus Aurelius
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
