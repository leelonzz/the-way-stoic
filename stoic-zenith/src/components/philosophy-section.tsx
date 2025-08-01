import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote, MessageCircle } from "lucide-react"

export function PhilosophySection() {
  const philosophers = [
    {
      name: "Seneca",
      title: "The Practical Advisor",
      period: "4 BC - 65 AD",
      description:
        "Roman statesman and philosopher who wrote extensively on practical ethics and how to live well despite life's challenges.",
      quote: "It is not that we have a short time to live, but that we waste a lot of it.",
      focus: "Letters & Political Wisdom",
      color: "cta",
      expertise: ["Practical ethics", "Time management", "Political wisdom", "Wealth and virtue"],
    },
    {
      name: "Epictetus",
      title: "The Teacher of Freedom",
      period: "50 - 135 AD",
      description:
        "Former slave turned philosopher who taught that true freedom comes from focusing only on what we can control.",
      quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
      focus: "Practical Teachings",
      color: "secondary",
      expertise: ["Dichotomy of control", "Personal freedom", "Practical philosophy", "Overcoming adversity"],
    },
    {
      name: "Marcus Aurelius",
      title: "The Philosopher Emperor",
      period: "121 - 180 AD",
      description:
        "Roman Emperor whose personal journal became one of the greatest works of philosophy, showing how to apply stoic principles to leadership.",
      quote: "The best revenge is not to be like your enemy.",
      focus: "Applied Philosophy",
      color: "accent",
      expertise: ["Leadership", "Duty and virtue", "Self-reflection", "Applied philosophy"],
    },
  ]

  return (
    <section id="philosophy" className="py-24 bg-gradient-to-br from-parchment to-hero">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl lg:text-5xl mb-4">
            Learn from the <span className="text-cta">Greatest Minds</span>
          </h2>
          <p className="text-lg text-stone leading-relaxed">
            Engage with three legendary stoic philosophers through AI-powered conversations that bring their wisdom to
            life for your modern challenges.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {philosophers.map((philosopher, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-500 border-stone/20 bg-background/80 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Header */}
                <div
                  className={`p-6 bg-gradient-to-r ${
                    philosopher.color === "cta"
                      ? "from-cta/10 to-cta/5"
                      : philosopher.color === "secondary"
                        ? "from-cta/10 to-cta/5"
                        : "from-accent/10 to-accent/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {philosopher.period}
                    </Badge>
                    <div
                      className={`p-2 rounded-lg ${
                        philosopher.color === "cta"
                          ? "bg-cta/20"
                          : philosopher.color === "secondary"
                            ? "bg-cta/20"
                            : "bg-accent/20"
                      }`}
                    >
                      <Quote
                        className={`h-4 w-4 ${
                          philosopher.color === "cta"
                            ? "text-cta"
                            : philosopher.color === "secondary"
                              ? "text-cta"
                              : "text-accent"
                        }`}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-1">{philosopher.name}</h3>
                  <p
                    className={`text-sm font-medium ${
                      philosopher.color === "cta"
                        ? "text-cta"
                        : philosopher.color === "secondary"
                          ? "text-cta"
                          : "text-accent"
                    }`}
                  >
                    {philosopher.title}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p className="text-stone text-sm leading-relaxed">{philosopher.description}</p>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-stone/30 pl-4 italic text-ink text-sm">
                    "{philosopher.quote}"
                  </blockquote>

                  {/* Focus */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-stone">Focus:</span>
                    <Badge variant="secondary" className="text-xs">
                      {philosopher.focus}
                    </Badge>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}