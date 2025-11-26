import { Button } from '@/components/ui/button';
import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { Link, usePage } from '@inertiajs/react';
import Section from '../../partials/section';

const CTA = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize } = props;
   const ctaSection = getPageSection(page, 'prime_cta');

   return (
      <Section customize={customize} pageSection={ctaSection} containerClass="py-16 pb-24">
         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary px-8 py-12 text-white">
            <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -right-10 bottom-10 h-24 w-24 rounded-full bg-black/20 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
               <div className="max-w-2xl space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em]">{ctaSection?.title}</p>
                  <h2 className="text-3xl font-semibold leading-snug">{ctaSection?.description}</h2>
               </div>

               {ctaSection?.properties?.button_link && ctaSection?.properties?.button_text && (
                  <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                     <Link href={ctaSection.properties.button_link}>{ctaSection.properties.button_text}</Link>
                  </Button>
               )}
            </div>
         </div>
      </Section>
   );
};

export default CTA;
