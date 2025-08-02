import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Star } from 'lucide-react'

interface PricingSectionProps {
  onGetStarted?: () => void
}

export function PricingSection({
  onGetStarted,
}: PricingSectionProps): JSX.Element {
  const plans = [
    {
      name: 'Seeker',
      price: 'Free',
      period: '',
      description: 'Perfect for beginning your stoic journey',
      features: [
        'Unlimited journal entries',
        'Quote library & saving',
        'Memento mori calendar',
        'Daily stoic quotes',
        'Basic streak tracking',
        'Daily journal prompts',
      ],
      cta: 'Start Free',
      popular: false,
      color: 'stone',
    },
    {
      name: 'Philosopher',
      price: '$14',
      period: 'per month',
      description: 'For dedicated practitioners of stoic wisdom',
      features: [
        'Everything in Free',
        'Unlimited chat with philosopher',
        'Course (coming soon)',
        'Priority support',
        'Advanced streak analytics',
        'Personalized insights',
        'Export journal entries',
      ],
      cta: 'Begin Practice',
      popular: true,
      color: 'cta',
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
            Start your journey with our free plan, or unlock the full power of
            stoic wisdom with our comprehensive paid options.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-cta/50 shadow-lg scale-105'
                  : 'border-stone/20 hover:border-stone/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cta to-cta/80 text-white text-center py-2 text-sm font-medium">
                  <Star
                    className="inline h-4 w-4 mr-1"
                    style={{ color: '#da7756' }}
                  />
                  Most Popular
                </div>
              )}

              <CardHeader
                className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}
              >
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-ink">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-ink">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-stone text-sm">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="text-stone">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <Check
                        className="h-5 w-5 mt-0.5 flex-shrink-0"
                        style={{ color: '#da7756' }}
                      />
                      <span className="text-stone text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onGetStarted}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-cta hover:bg-cta/90 text-white'
                      : plan.color === 'secondary'
                        ? 'bg-secondary hover:bg-secondary/90 text-white'
                        : 'bg-stone/10 hover:bg-stone/20 text-stone border border-stone/30'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
