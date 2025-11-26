import { Button } from '@/components/ui/button';
import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { Link, usePage } from '@inertiajs/react';
import Section from '../../partials/section';

const accentPalette = ['#10EDF5', '#8BE28B', '#FFD65A', '#FF9F68', '#B38CFF', '#84D8FF'];

const GradeTracks = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, direction, locale, categories } = props;
   const gradeSection = getPageSection(page, 'prime_grades');
   const gradeCategories = categories?.data ?? [];
   const isRTL = direction === 'rtl';
   const gradeLabel = isRTL
      ? gradeSection?.properties?.grade_label_ar || gradeSection?.properties?.grade_label || 'الصف'
      : gradeSection?.properties?.grade_label_en || 'Grade';
   const exploreText = isRTL
      ? gradeSection?.properties?.explore_text_ar || 'تعرّف على الصف'
      : gradeSection?.properties?.explore_text_en || 'Explore this grade';
   const viewAllHref = gradeSection?.properties?.view_all_link || '/courses/all';
   const viewAllText = isRTL
      ? gradeSection?.properties?.view_all_text_ar || 'عرض جميع المراحل'
      : gradeSection?.properties?.view_all_text_en || 'View all tracks';

   return (
      <Section customize={customize} pageSection={gradeSection} containerClass="py-16" data-testid="grade-tracks">
         <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
            <div>
               <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">{gradeSection?.title}</p>
               <h2 className="mt-2 text-3xl font-semibold">{gradeSection?.sub_title}</h2>
               <p className="mt-2 text-muted-foreground">{gradeSection?.description}</p>
            </div>

            <Button asChild variant="secondary" className="rounded-full px-6 py-6 text-sm font-semibold">
               <Link href={viewAllHref}>{viewAllText}</Link>
            </Button>
         </div>

         {gradeCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               No grade categories are configured yet. Add categories from the dashboard to populate this section.
            </div>
         ) : (
            <div className="rounded-[32px] border border-border bg-gradient-to-br from-[#f4f8f9] to-[#e8f4f6] p-5 shadow-inner lg:p-8">
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {gradeCategories.slice(0, 12).map((category, index) => {
                     const accentColor = category.accent_color || accentPalette[index % accentPalette.length];
                     const localizedTitle = isRTL ? category.title_ar || category.title : category.title_en || category.title;
                     const localizedSubtitle = isRTL ? category.subtitle_ar || exploreText : category.subtitle_en || exploreText;
                     const formattedTitle = isRTL ? category.meta?.formatted_name_ar : category.meta?.formatted_name_en;
                     const numberBadge = category.meta?.number ?? index + 1;
                     const children = category.children || [];
                     const nameContent = formattedTitle || localizedTitle;

                     return (
                        <Link
                           key={category.id}
                           href={route('category.courses', [category.slug])}
                           className="grade-card group flex flex-col rounded-3xl border border-border/50 bg-white/95 px-4 py-5 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:border-primary/20"
                           dir={isRTL ? 'rtl' : 'ltr'}
                           style={{ textDecoration: 'none' }}
                        >
                           <div className={`flex w-full items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                              <div className="flex flex-1 flex-col">
                                 <p className="text-xs font-semibold text-muted-foreground mb-1">{gradeLabel}</p>
                                 {formattedTitle ? (
                                    <span className="text-lg font-bold leading-tight text-primary" dangerouslySetInnerHTML={{ __html: nameContent }} />
                                 ) : (
                                    <span className="text-lg font-bold leading-tight text-primary">{nameContent}</span>
                                 )}
                                 <span className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    {localizedSubtitle || exploreText}
                                    <span className="inline-block h-2 w-10 rounded-full" style={{ backgroundColor: accentColor }} />
                                 </span>
                              </div>

                              <div className="relative flex items-center justify-center">
                                 <span className="text-4xl font-black text-foreground/10 transition group-hover:text-primary/20">{numberBadge}</span>
                              </div>
                           </div>

                           {children.length > 0 && (
                              <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                 {children.map((child) => {
                                    const childLabel = isRTL ? child.title_ar || child.title : child.title_en || child.title;
                                    return (
                                       <span
                                          key={child.slug}
                                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition group-hover:bg-primary/20"
                                       >
                                          {childLabel}
                                       </span>
                                    );
                                 })}
                              </div>
                           )}
                        </Link>
                     );
                  })}
               </div>
            </div>
         )}
      </Section>
   );
};

export default GradeTracks;
