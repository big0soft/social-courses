import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { usePage } from '@inertiajs/react';
import Section from '../../partials/section';
import { Sprout, Users, Star, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const Stats = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, direction } = props;
   const statsSection = getPageSection(page, 'prime_stats');
   const stats = statsSection?.properties?.array?.slice(1) ?? [];
   const isRTL = direction === 'rtl';

   // Default stats if none configured
   const defaultStats = [
      { label: isRTL ? 'عام 2023 تأسست عام' : 'Founded in 2023', value: '2023', description: '', icon: Sprout },
      { label: isRTL ? 'ألف طالب' : 'Students', value: '50+', description: isRTL ? 'خبرة في تعليم الأطفال' : 'Experience in teaching children', icon: Users },
      { label: isRTL ? 'معلم' : 'Teachers', value: '+11', description: isRTL ? 'مدرس ذو خبرة عالية' : 'Highly experienced teachers', icon: GraduationCap },
      { label: isRTL ? 'معدل تقييم الطلاب لنا' : 'Student Rating', value: '0.0/5.0', description: '', icon: Star },
   ];

   const displayStats = stats.length > 0 ? stats : defaultStats;

   const iconMap: Record<string, any> = {
      plant: Sprout,
      grain: Users,
      users: Users,
      star: Star,
      graduation: GraduationCap,
      default: Sprout,
   };

   return (
      <Section customize={customize} pageSection={statsSection} containerClass="py-16" contentClass="space-y-10">
         <div className={cn('mb-10 max-w-2xl', isRTL && 'text-right')}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">{statsSection?.title || (isRTL ? 'إحصائيات' : 'Statistics')}</p>
            <h2 className="mt-2 text-3xl font-semibold">{statsSection?.sub_title || (isRTL ? 'منصة ألفا بلغة الأرقام' : 'Alpha Platform in Numbers')}</h2>
         </div>

         {displayStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">Impact metrics will appear here once configured.</p>
         ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
               {displayStats.map((stat: any, index: number) => {
                  const IconComponent = stat.icon ? iconMap[stat.icon.toLowerCase()] || iconMap.default : (index === 0 ? Sprout : index === 1 ? Users : index === 2 ? GraduationCap : Star);
                  return (
                     <div key={`${stat.label}-${index}`} className={cn('rounded-2xl border border-border bg-background p-6 shadow-card transition hover:shadow-lg', isRTL && 'text-right')}>
                        <div className={cn('mb-4 flex items-center gap-3', isRTL && 'flex-row-reverse justify-end')}>
                           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <IconComponent className="h-6 w-6 text-primary" />
                           </div>
                        </div>
                        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-primary">{stat.value}</p>
                        {stat.description && <p className="mt-3 text-sm text-muted-foreground">{stat.description}</p>}
                     </div>
                  );
               })}
            </div>
         )}
      </Section>
   );
};

export default Stats;
