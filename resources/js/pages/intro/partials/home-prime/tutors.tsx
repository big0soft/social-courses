import { Button } from '@/components/ui/button';
import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { Link, usePage } from '@inertiajs/react';
import Section from '../../partials/section';
import { cn } from '@/lib/utils';

const placeholderAvatars = [
   '/assets/images/intro/default/instructors/instructor-1.png',
   '/assets/images/intro/default/instructors/instructor-2.png',
   '/assets/images/intro/default/instructors/instructor-3.png',
   '/assets/images/intro/default/instructors/instructor-4.png',
];

const Tutors = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, topInstructors = [], direction } = props;
   const tutorSection = getPageSection(page, 'prime_tutors');
   const isRTL = direction === 'rtl';

   return (
      <Section customize={customize} pageSection={tutorSection} containerClass="py-16">
         <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
            <div>
               <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">{tutorSection?.title}</p>
               <h2 className="mt-2 text-3xl font-semibold">{tutorSection?.sub_title}</h2>
               <p className="mt-2 text-muted-foreground">{tutorSection?.description}</p>
            </div>

            <Button asChild variant="outline" className="rounded-full px-6 py-6 text-sm font-semibold">
               <Link href="/instructors">{isRTL ? 'مشاهدة جميع المعلمين' : 'View all teachers'}</Link>
            </Button>
         </div>

         {topInstructors.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               {isRTL ? 'سيظهر المعلمون هنا بمجرد الموافقة عليهم' : 'Tutors will appear here once instructors are approved.'}
            </div>
         ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
               {topInstructors.slice(0, 4).map((instructor, index) => {
                  const fallback = placeholderAvatars[index % placeholderAvatars.length];
                  const photo = instructor.user?.photo || fallback;
                  return (
                     <div key={instructor.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative mb-4 h-52 overflow-hidden rounded-2xl">
                           <img src={photo} alt={instructor.user?.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                           <div className={cn('absolute bottom-4 text-white', isRTL ? 'right-4 left-4 text-right' : 'left-4 right-4 text-left')}>
                              <p className="text-lg font-bold">{instructor.user?.name}</p>
                              <p className="text-sm text-white/90">{instructor.designation}</p>
                           </div>
                        </div>

                        <p className={cn('line-clamp-3 flex-1 text-sm text-muted-foreground', isRTL && 'text-right')}>{instructor.biography}</p>

                        <Button asChild variant="ghost" className={cn('mt-4 justify-between rounded-full px-4', isRTL && 'flex-row-reverse')}>
                           <Link href={route('instructors.show', instructor.id)}>
                              {isRTL ? 'عرض الملف الشخصي' : 'View profile'}
                              <span aria-hidden className={isRTL ? 'rotate-180' : ''}>↗</span>
                           </Link>
                        </Button>
                     </div>
                  );
               })}
            </div>
         )}
      </Section>
   );
};

export default Tutors;

