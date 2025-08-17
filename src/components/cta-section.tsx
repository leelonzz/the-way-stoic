import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Users, Zap } from "lucide-react"

interface CTASectionProps {
  onGetStarted?: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-sage/20 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Content */}
                <div className="p-8 md:p-12 space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-stone md:text-4xl">
                      Begin Your <span className="text-primary">Stoic Journey</span> Today
                    </h2>
                    <p className="text-lg text-sage leading-relaxed">
                      Join thousands of people who have transformed their lives through ancient wisdom and modern
                      technology. Start building resilience, gratitude, and inner peace.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <BookOpen className="h-4 w-4" style={{ color: "#da7756" }} />
                      </div>
                      <span className="text-sage">Start with guided daily practices</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <Users className="h-4 w-4" style={{ color: "#da7756" }} />
                      </div>
                      <span className="text-sage">Learn from ancient philosophers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <Zap className="h-4 w-4" style={{ color: "#da7756" }} />
                      </div>
                      <span className="text-sage">Build lasting habits and wisdom</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={onGetStarted}
                      className="bg-primary hover:bg-primary/90 text-white flex-1"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={onGetStarted}
                      className="border-sage/30 text-sage hover:bg-sage/5 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </div>

                  <p className="text-sm text-sage">Free for 14 days, then $9/month. Cancel anytime.</p>
                </div>

                {/* Right Visual */}
                <div className="bg-gradient-to-br from-parchment to-hero p-8 md:p-12 flex items-center justify-center">
                  <div className="space-y-6 max-w-sm">
                    {/* Mock Journal Entry */}
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-stone/20">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="text-sm font-medium text-ink">Today's Reflection</span>
                        </div>
                        <div className="space-y-2 text-sm text-stone">
                          <p>⭐ Thing I'm excited about: Learning stoic wisdom</p>
                          <p>😊 What would make today great: Practicing gratitude</p>
                          <p>🚫 Thing I must not do: React with anger</p>
                        </div>
                      </div>
                    </div>

                    {/* Mock Quote */}
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-stone/20">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-cta rounded-full"></div>
                          <span className="text-sm font-medium text-ink">Daily Wisdom</span>
                        </div>
                        <blockquote className="text-sm text-stone italic">
                          "You have power over your mind - not outside events."
                        </blockquote>
                        <p className="text-xs text-stone">— Marcus Aurelius</p>
                      </div>
                    </div>

                    {/* Mock Streak */}
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-stone/20">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink">Current Streak</span>
                          <span className="text-lg font-bold text-cta">7 days</span>
                        </div>
                        <div className="w-full bg-stone/20 rounded-full h-2">
                          <div className="bg-cta h-2 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
