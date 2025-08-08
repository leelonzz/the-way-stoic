import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Mail, X } from 'lucide-react'

interface FooterLink {
  name: string
  href: string
  onClick?: () => void
}

export function Footer(): JSX.Element {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const footerLinks: {
    product: FooterLink[]
    resources: FooterLink[]
    company: FooterLink[]
  } = {
    product: [
      {
        name: 'Features',
        href: '#features',
        onClick: () => scrollToSection('features'),
      },
      {
        name: 'Pricing',
        href: '#pricing',
        onClick: () => scrollToSection('pricing'),
      },
      {
        name: 'Philosophy',
        href: '#philosophy',
        onClick: () => scrollToSection('philosophy'),
      },
      { name: 'Roadmap', href: '#' },
    ],
    resources: [
      { name: 'Blog', href: '#' },
      { name: 'Stoic Library', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Help Center', href: '#' },
    ],
    company: [
      {
        name: 'About',
        href: '#about',
        onClick: () => scrollToSection('about'),
      },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Contact', href: '/contact' },
    ],
  }

  return (
    <footer className="bg-parchment border-t border-stone/20">
      <div className="container px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">Σ</span>
              </div>
              <span className="text-xl font-bold text-ink">The Stoic Way</span>
            </div>
            <p className="text-stone max-w-md leading-relaxed">
              Transform your life through ancient wisdom and modern technology.
              Build resilience, practice gratitude, and find inner peace through
              daily stoic practices.
            </p>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-stone hover:text-ink"
                asChild
              >
                <a href="https://x.com/thewaystoic" aria-label="X">
                  <X className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-stone hover:text-ink"
                asChild
              >
                <a href="mailto:support@thewaystoic.site" aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-stone hover:text-ink transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-stone hover:text-ink transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-stone hover:text-ink transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-stone hover:text-ink transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-stone hover:text-ink transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-stone/20" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-stone text-sm">
            © 2025 The Stoic Way. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-stone">
            <span>Made with wisdom and code</span>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>Ancient wisdom, modern app</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
