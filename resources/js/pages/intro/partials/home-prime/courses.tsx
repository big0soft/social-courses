import CourseCard2 from '@/components/cards/course-card-2';
import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { usePage } from '@inertiajs/react';
import Section from '../../partials/section';

const Courses = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, topCourses = [] } = props;
   const courseSection = getPageSection(page, 'top_courses');

   return (
      <Section customize={customize} pageSection={courseSection} containerClass="py-16">
         <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">{courseSection?.title}</p>
            <h2 className="mt-2 text-3xl font-semibold">{courseSection?.sub_title}</h2>
            <p className="mt-2 text-muted-foreground">{courseSection?.description}</p>
         </div>

         {topCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               No signature cohorts selected yet. Use the page builder to pin courses here.
            </div>
         ) : (
            <div className="grid gap-6 lg:grid-cols-2">
               {topCourses.slice(0, 4).map((course) => (
                  <CourseCard2 key={course.id} course={course} />
               ))}
            </div>
         )}
      </Section>
   );
};

export default Courses;


