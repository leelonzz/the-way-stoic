import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'

export function TestimonialsSection(): JSX.Element {
  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-hero to-parchment overflow-x-hidden"
    >
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-inknut font-bold tracking-tight text-ink md:text-4xl lg:text-5xl mb-4">
            What Our <span className="text-primary">Community</span> Says
          </h2>
          <p className="text-lg text-stone leading-relaxed">
            Real stories from people who have transformed their lives through
            ancient Stoic wisdom and modern tools for mindful living.
          </p>
        </div>

        <div className="w-full mx-auto">
          <StaggerTestimonials />
        </div>
      </div>
    </section>
  )
}
