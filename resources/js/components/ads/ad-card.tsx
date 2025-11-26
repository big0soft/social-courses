import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface AdCardProps extends React.HTMLAttributes<HTMLDivElement> {
   ad: Ad;
}

export const AdCard = ({ ad, className, ...props }: AdCardProps) => {
   return (
      <div
         className={cn(
            'relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-muted shadow-2xl',
            className,
         )}
         {...props}
      >
         <img src={ad.image} alt={ad.title} className="absolute inset-0 h-full w-full object-cover object-center" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
         <div className="relative z-10 flex flex-col gap-4 p-8 text-white">
            {ad.tagline && <p className="text-sm uppercase tracking-[0.3em] text-white/80">{ad.tagline}</p>}
            <h3 className="text-3xl font-semibold leading-tight">{ad.title}</h3>

            {ad.cta_label && (
               <div>
                  <Button asChild size="lg" className="gap-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                     <a href={ad.cta_url || '#'} aria-label={ad.cta_label}>
                        {ad.cta_label}
                        <ArrowUpRight className="h-4 w-4" />
                     </a>
                  </Button>
               </div>
            )}
         </div>
      </div>
   );
};

