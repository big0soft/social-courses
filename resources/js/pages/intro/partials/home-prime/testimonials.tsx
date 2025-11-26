import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { usePage } from '@inertiajs/react';
import Section from '../../partials/section';

const Testimonials = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize } = props;
   const testimonialsSection = getPageSection(page, 'prime_testimonials');
   const testimonials = testimonialsSection?.properties?.array?.slice(1) ?? [];

   return (
      <Section customize={customize} pageSection={testimonialsSection} containerClass="py-16">
         <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">{testimonialsSection?.title}</p>
            <h2 className="mt-2 text-3xl font-semibold">{testimonialsSection?.sub_title}</h2>
         </div>

         {testimonials.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               Add testimonial entries to this section to display success stories.
            </div>
         ) : (
            <div className="grid gap-6 lg:grid-cols-3">
               {testimonials.map((testimonial, index) => (
                  <div key={`${testimonial.name}-${index}`} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                     <div className="mb-4 flex items-center gap-3">
                        <img
                           src={testimonial.avatar || '/assets/avatars/avatar-1.png'}
                           alt={testimonial.name}
                           className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                           <p className="font-semibold">{testimonial.name}</p>
                           <p className="text-sm text-muted-foreground">{testimonial.grade}</p>
                        </div>
                     </div>
                     <p className="text-muted-foreground text-sm leading-relaxed">{testimonial.quote}</p>
                  </div>
               ))}
            </div>
         )}
      </Section>
   );
};

export default Testimonials;

