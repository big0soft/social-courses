import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { AdCard } from './ad-card';

interface AdSliderProps {
   ads: Ad[];
   loading: boolean;
   error: string | null;
}

export const AdSlider = ({ ads, loading, error }: AdSliderProps) => {
   if (loading) {
      return (
         <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed">
            <p className="text-muted-foreground text-sm">Loading featured programs…</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-destructive/40 bg-destructive/5">
            <p className="text-destructive text-sm">{error}</p>
         </div>
      );
   }

   if (!ads.length) {
      return (
         <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed">
            <p className="text-muted-foreground text-sm">No featured ads available right now. Check back soon!</p>
         </div>
      );
   }

   return (
      <Carousel
         opts={{ loop: true, align: 'start' }}
         plugins={[
            Autoplay({
               delay: 4500,
            }),
         ]}
         className="relative"
      >
         <CarouselContent>
            {ads.map((ad) => (
               <CarouselItem key={ad.id} className="basis-full">
                  <AdCard ad={ad} />
               </CarouselItem>
            ))}
         </CarouselContent>

         <CarouselPrevious className="bg-white/70 text-black hover:bg-white absolute -left-4 top-1/2 -translate-y-1/2 shadow-lg" />
         <CarouselNext className="bg-white/70 text-black hover:bg-white absolute -right-4 top-1/2 -translate-y-1/2 shadow-lg" />
      </Carousel>
   );
};

