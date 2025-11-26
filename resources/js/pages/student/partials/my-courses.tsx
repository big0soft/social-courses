import ProgressCard from '@/components/cards/course-card-4';
import { Card } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types/global';

const MyCourses = ({ enrollments }: { enrollments: Enrollment[] }) => {
   const { props } = usePage<SharedData>();
   const { frontend } = props.translate;
   return enrollments.length > 0 ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
         {enrollments.map((enrollment) => (
            <ProgressCard key={enrollment.id} enrollment={enrollment} className="border-none" />
         ))}
      </div>
   ) : (
      <Card className="flex items-center justify-center p-6">
         <p>{frontend.no_courses_found}</p>
      </Card>
   );
};

export default MyCourses;
