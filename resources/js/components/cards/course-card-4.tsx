import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import ButtonGradientPrimary from '../button-gradient-primary';

interface Props {
   className?: string;
   enrollment: Enrollment;
}

const CourseCard4 = ({ enrollment, className }: Props) => {
   const { course, completion, watch_history } = enrollment;
   const { props } = usePage();
   const { translate } = props as any;
   const { frontend, button } = translate;

   return (
      <Card className={cn('overflow-hidden', className)}>
         <CardHeader className="p-0">
            <div className="p-2 pb-0">
               <div className="relative h-[220px] w-full overflow-hidden rounded-lg">
                  <img
                     src={course.thumbnail || '/assets/images/blank-image.jpg'}
                     alt={course.title}
                     className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/blank-image.jpg';
                     }}
                  />
               </div>
            </div>
         </CardHeader>

         <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
               <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                     <AvatarImage src={course.instructor.user.photo || ''} alt={course.instructor.user.name} className="object-cover" />
                     <AvatarFallback>IM</AvatarFallback>
                  </Avatar>

                  <p className="text-xs font-medium">{course.instructor.user.name}</p>
               </div>
            </div>

            <p className="text-sm font-semibold">{course.title}</p>

            <div className="w-full space-y-1 pt-4 pb-2">
               <p className="text-muted-foreground flex items-center justify-between text-xs font-medium">
                  <span>{frontend.progress}</span>
                  <span>{completion?.completion ?? 0}%</span>
               </p>

               <Progress value={completion?.completion ?? 0} className="h-1" />
            </div>
         </CardContent>

         {watch_history && (
            <CardFooter className="p-4 pt-0">
               <ButtonGradientPrimary asChild shadow={false} containerClass="w-full" className="to-primary-light hover:to-primary-light w-full">
                  <Link
                     href={route('course.player', {
                        type: watch_history.current_watching_type,
                        watch_history: watch_history.id,
                        lesson_id: watch_history.current_watching_id,
                     })}
                  >
                     {button.continue}
                  </Link>
               </ButtonGradientPrimary>
            </CardFooter>
         )}
      </Card>
   );
};

export default CourseCard4;
