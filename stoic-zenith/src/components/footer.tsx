import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Mail, Twitter, Github } from "lucide-react"

export function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Philosophy", href: "#philosophy" },
      { name: "Roadmap", href: "#" },
    ],
    resources: [
      { name: "Blog", href: "#" },
      { name: "Stoic Library", href: "#" },
      { name: "Community", href: "#" },
      { name: "Help Center", href: "#" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Contact", href: "#" },
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
              Transform your life through ancient wisdom and modern technology. Build resilience, practice gratitude,
              and find inner peace through daily stoic practices.
            </p>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" className="text-stone hover:text-ink">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-stone hover:text-ink">
                <Github className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-stone hover:text-ink">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-stone hover:text-ink transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-stone hover:text-ink transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-stone hover:text-ink transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-stone/20" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-stone text-sm">© 2024 The Stoic Way. All rights reserved.</p>
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