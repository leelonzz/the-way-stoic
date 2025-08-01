import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"

interface PricingSectionProps {
  onGetStarted?: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const plans = [
    {
      name: "Seeker",
      price: "Free",
      period: "forever",
      description: "Perfect for beginning your stoic journey",
      features: [
        "Daily journal prompts",
        "Basic streak tracking",
        "Daily stoic quotes",
        "Limited mentor conversations (5/month)",
        "Basic memento mori calendar",
      ],
      cta: "Start Free",
      popular: false,
      color: "stone",
    },
    {
      name: "Philosopher",
      price: "$9",
      period: "per month",
      description: "For dedicated practitioners of stoic wisdom",
      features: [
        "Unlimited journal entries",
        "Advanced streak analytics",
        "Unlimited mentor conversations",
        "Personalized insights",
        "Full memento mori features",
        "Quote library & saving",
        "Export journal entries",
        "Priority support",
      ],
      cta: "Begin Practice",
      popular: true,
      color: "cta",
    },
    {
      name: "Sage",
      price: "$19",
      period: "per month",
      description: "For those seeking mastery and deeper wisdom",
      features: [
        "Everything in Philosopher",
        "Advanced AI mentor personalities",
        "Custom philosophical frameworks",
        "Group discussions & community",
        "Exclusive masterclasses",
        "Personal philosophy coach",
        "Advanced analytics & insights",
        "Early access to new features",
      ],
      cta: "Achieve Mastery",
      popular: false,
      color: "secondary",
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl lg:text-5xl mb-4">
            Choose Your <span className="text-cta">Philosophical Path</span>
          </h2>
          <p className="text-lg text-stone leading-relaxed">
            Start your journey with our free plan, or unlock the full power of stoic wisdom with our comprehensive paid
            options.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "border-cta/50 shadow-lg scale-105" : "border-stone/20 hover:border-stone/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cta to-cta/80 text-white text-center py-2 text-sm font-medium">
                  <Star className="inline h-4 w-4 mr-1" style={{ color: "#da7756" }} />
                  Most Popular
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-ink">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-ink">{plan.price}</span>
                    <span className="text-stone text-sm">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-stone">{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#da7756" }} />
                      <span className="text-stone text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onGetStarted}
                  className={`w-full ${
                    plan.popular
                      ? "bg-cta hover:bg-cta/90 text-white"
                      : plan.color === "secondary"
                        ? "bg-secondary hover:bg-secondary/90 text-white"
                        : "bg-stone/10 hover:bg-stone/20 text-stone border border-stone/30"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-stone text-sm">
            All plans include a 14-day free trial. No credit card required for the free plan.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-stone">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payment</span>
          </div>
        </div>
      </div>
    </section>
  )
}