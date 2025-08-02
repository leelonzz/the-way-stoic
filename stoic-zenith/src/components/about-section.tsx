import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Target, Users, Lightbulb } from 'lucide-react'

export function AboutSection(): JSX.Element {
  const values = [
    {
      icon: Heart,
      title: 'Ancient Wisdom',
      description:
        'We believe that the timeless teachings of Stoic philosophy can transform modern lives, helping people find inner peace and resilience.',
    },
    {
      icon: Target,
      title: 'Practical Application',
      description:
        "Our mission is to make ancient wisdom accessible and actionable for today's challenges, not just theoretical knowledge.",
    },
    {
      icon: Users,
      title: 'Community Growth',
      description:
        "We're building a community of people committed to personal growth through philosophical practice and mutual support.",
    },
    {
      icon: Lightbulb,
      title: 'Thoughtful Innovation',
      description:
        'We combine the best of technology with respect for ancient wisdom, creating tools that enhance rather than replace human reflection.',
    },
  ]

  return (
    <section
      id="about"
      className="py-24 bg-gradient-to-br from-hero to-parchment"
    >
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl lg:text-5xl mb-4">
            About <span className="text-primary">The Stoic Way</span>
          </h2>
          <p className="text-lg text-stone leading-relaxed">
            We&apos;re on a mission to make ancient Stoic wisdom accessible to
            modern lives, helping people build resilience, find inner peace, and
            live with purpose.
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <Card className="overflow-hidden border-stone/20 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <Badge variant="outline" className="mb-4">
                      Our Story
                    </Badge>
                    <h3 className="text-2xl font-bold text-ink mb-4">
                      Born from Personal Transformation
                    </h3>
                    <p className="text-stone leading-relaxed mb-4">
                      The Stoic Way was created by individuals who experienced
                      firsthand the transformative power of Stoic philosophy.
                      What started as personal journaling and study became a
                      mission to help others discover the same peace and
                      resilience that ancient wisdom can provide.
                    </p>
                    <p className="text-stone leading-relaxed">
                      We realized that while Stoic teachings are timeless, they
                      needed modern tools to make them accessible to busy,
                      connected lives. Our platform bridges 2,000 years of
                      wisdom with today&apos;s technology.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="font-medium text-ink">Founded</span>
                    </div>
                    <p className="text-stone">
                      2024 - With a vision to democratize ancient wisdom
                    </p>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      <span className="font-medium text-ink">Mission</span>
                    </div>
                    <p className="text-stone">
                      Make Stoic philosophy practical and accessible for modern
                      life
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <span className="font-medium text-ink">Vision</span>
                    </div>
                    <p className="text-stone">
                      A world where everyone has access to tools for inner peace
                      and resilience
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-ink mb-4">
              Our Core Values
            </h3>
            <p className="text-stone max-w-2xl mx-auto">
              These principles guide everything we do, from product development
              to community building.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-stone/20 bg-background/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent
                          className="h-6 w-6"
                          style={{ color: '#da7756' }}
                        />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-ink mb-3 group-hover:text-primary transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-sm text-stone leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
