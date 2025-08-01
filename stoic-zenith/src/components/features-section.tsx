import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MessageCircle, Calendar, Quote, Target, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Daily Stoic Journal",
      description: "Start each morning with intention and end each evening with reflection through guided prompts.",
      details: [
        "Morning kickstart with excitement and goals",
        "Evening gratitude and wins reflection",
        "Streak tracking and progress insights",
      ],
      color: "accent",
      badge: "Core Practice",
    },
    {
      icon: MessageCircle,
      title: "Philosopher Mentors",
      description:
        "Engage in meaningful conversations with Seneca, Epictetus, and Marcus Aurelius for personalized guidance.",
      details: [
        "AI-powered conversations that feel authentic",
        "Contextual advice based on your journal",
        "Three distinct philosophical perspectives",
      ],
      color: "secondary",
      badge: "AI-Powered",
    },
    {
      icon: Calendar,
      title: "Memento Mori Calendar",
      description: "Visualize your life's journey with a powerful reminder of time's precious nature.",
      details: [
        "Personalized life expectancy visualization",
        "Weekly progress tracking",
        "Motivational perspective on mortality",
      ],
      color: "primary",
      badge: "Perspective",
    },
    {
      icon: Quote,
      title: "Daily Wisdom",
      description: "Discover curated quotes and teachings from the greatest stoic philosophers throughout history.",
      details: ["Daily featured quotes with context", "Save your favorite wisdom", "Searchable philosophy library"],
      color: "sage",
      badge: "Learning",
    },
    {
      icon: Target,
      title: "Practical Application",
      description: "Transform ancient wisdom into actionable insights for modern challenges and daily decisions.",
      details: [
        "Real-world problem solving",
        "Stress and anxiety management",
        "Leadership and decision-making guidance",
      ],
      color: "stone",
      badge: "Applied",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your philosophical growth through streaks, insights, and personal development metrics.",
      details: ["Journal consistency tracking", "Mood and gratitude trends", "Personal growth analytics"],
      color: "cta",
      badge: "Growth",
    },
  ]

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-stone md:text-4xl lg:text-5xl mb-4">
            Everything You Need for <span className="text-primary">Stoic Practice</span>
          </h2>
          <p className="text-lg text-sage leading-relaxed">
            A complete toolkit for integrating ancient wisdom into your modern life, designed to build resilience,
            gratitude, and philosophical understanding.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-sage/20 bg-card/50 backdrop-blur-sm"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-start">
                    <div className="flex h-12 w-12 items-center justify-center">
                      <IconComponent
                        className="h-6 w-6"
                        style={{
                          color: "#da7756",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-stone group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sage mt-2">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}