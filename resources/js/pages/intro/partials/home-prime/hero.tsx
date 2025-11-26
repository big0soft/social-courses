import { AdSlider } from '@/components/ads/ad-slider';
import { Button } from '@/components/ui/button';
import { getPageSection } from '@/lib/page';
import { cn } from '@/lib/utils';
import { useAds } from '@/hooks/use-ads';
import { IntroPageProps } from '@/types/page';
import { ArrowRight, Search } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import Section from '../../partials/section';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useState } from 'react';

const Hero = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, direction } = props;
   const heroSection = getPageSection(page, 'hero');
   const { ads, loading, error } = useAds();
   const isRTL = direction === 'rtl';
   const [searchQuery, setSearchQuery] = useState('');

   return (
      <Section
         customize={customize}
         pageSection={heroSection}
         containerClass="pt-24 pb-12 md:pt-32"
         contentClass="space-y-8"
      >
         {/* Hero Content */}
         <div className="grid gap-10 items-center lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.1fr)]">
            <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
               {heroSection?.properties?.badge && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
                     <span className="h-2 w-2 rounded-full bg-secondary-foreground" />
                     {heroSection.properties.badge}
                  </div>
               )}

               <div className="space-y-4">
                  <h1 className={cn('text-4xl font-bold leading-tight text-primary lg:text-5xl xl:text-6xl')}>
                     {heroSection?.sub_title || 'مستقبل ابنك يبدأ مع ألفا'}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                     {heroSection?.description || 'مستقبل ابنك يبدأ مع ألفا.... نحن روّاد التعليم الإلكتروني الذكي، نقدم لك الطريق الموثوق نحو التميز والنجاح وشعارنا دائماً "الفل"'}
                  </p>
               </div>

               {/* Search Bar */}
               <div className="relative">
                  <Search className={cn('absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground', isRTL ? 'right-4' : 'left-4')} />
                  <input
                     type="text"
                     placeholder={isRTL ? 'ابحث' : 'Search'}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className={cn(
                        'w-full rounded-full border border-border bg-background px-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary',
                        isRTL && 'text-right'
                     )}
                  />
               </div>

               <div className="flex flex-wrap items-center gap-4">
                  {heroSection?.properties?.button_link && heroSection?.properties?.button_text && (
                     <Button asChild size="lg" className="rounded-full px-8 py-6 text-base bg-primary hover:bg-primary/90">
                        <Link href={heroSection.properties.button_link}>
                           {heroSection.properties.button_text}
                           <ArrowRight className={cn('h-4 w-4', isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
                        </Link>
                     </Button>
                  )}
               </div>
            </div>

            {/* Carousel Section */}
            <div className="relative">
               <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-secondary/30 blur-[90px]" />
               <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/30 blur-[90px]" />

               {ads && ads.length > 0 ? (
                  <AdSlider ads={ads} loading={loading} error={error} />
               ) : (
                  <Carousel
                     opts={{ loop: true, align: 'start' }}
                     plugins={[
                        Autoplay({
                           delay: 4500,
                        }),
                     ]}
                     className="relative w-full"
                  >
                     <CarouselContent>
                        {[1, 2, 3, 4, 5].map((item) => (
                           <CarouselItem key={item} className="basis-full">
                              <div className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-2xl font-semibold text-muted-foreground">Carousel image {item}</p>
                                 </div>
                              </div>
                           </CarouselItem>
                        ))}
                     </CarouselContent>
                     <CarouselPrevious className="bg-white/90 text-black hover:bg-white absolute -left-4 top-1/2 -translate-y-1/2 shadow-lg border-0" />
                     <CarouselNext className="bg-white/90 text-black hover:bg-white absolute -right-4 top-1/2 -translate-y-1/2 shadow-lg border-0" />
                  </Carousel>
               )}
            </div>
         </div>
      </Section>
   );
};

export default Hero;
