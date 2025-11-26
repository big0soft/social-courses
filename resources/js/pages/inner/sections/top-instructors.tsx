import { Card } from '@/components/ui/card';
import { getPageSection } from '@/lib/page';
import Section from '@/pages/intro/partials/section';
import { Link, usePage } from '@inertiajs/react';
import { InnerPageProps } from '..';
import { useState } from 'react';

const placeholderAvatars = [
   '/assets/images/users/user-1.jpg',
   '/assets/images/users/user-2.jpg',
   '/assets/images/users/user-3.jpg',
   '/assets/images/users/user-4.jpg',
   '/assets/images/users/user-5.jpg',
   '/assets/images/users/user-6.jpg',
   '/assets/images/users/user-7.jpg',
   '/assets/images/users/user-8.jpg',
];

interface InstructorCardProps {
   instructor: any;
   fallbackImage: string;
}

const InstructorCard = ({ instructor, fallbackImage }: InstructorCardProps) => {
   const [imageSrc, setImageSrc] = useState(instructor.user?.photo || fallbackImage);
   const [imageError, setImageError] = useState(false);

   const handleImageError = () => {
      if (!imageError) {
         setImageError(true);
         setImageSrc(fallbackImage);
      }
   };

   return (
      <Card className="!shadow-card-lg relative overflow-hidden rounded-2xl">
         <Link href={route('instructors.show', instructor.id)}>
            <div className="relative h-[300px] overflow-hidden bg-muted">
               <img
                  className="h-full w-full object-cover object-center"
                  src={imageSrc}
                  alt={instructor.user?.name || 'Instructor'}
                  onError={handleImageError}
               />
            </div>
         </Link>

         <div className="space-y-1 py-4 text-center">
            <p className="font-semibold">{instructor.user?.name}</p>
            <p className="text-muted-foreground text-sm">{instructor.designation}</p>
         </div>
      </Card>
   );
};

const TopInstructors = () => {
   const { props } = usePage<InnerPageProps>();
   const { innerPage, customize, topInstructors } = props;
   const topInstructorsSection = getPageSection(innerPage, 'top_instructors');

   return (
      <Section customize={customize} pageSection={topInstructorsSection} containerClass="py-[120px]">
         <div className="relative z-10 mx-auto mb-8 max-w-lg text-center">
            <h2 className="mb-2 text-2xl font-bold sm:text-[30px]">{topInstructorsSection?.title}</h2>
            <p className="text-muted-foreground">{topInstructorsSection?.description}</p>
         </div>

         <div className="relative">
            <div className="relative z-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
               {topInstructors.map((instructor, index) => {
                  const fallback = placeholderAvatars[index % placeholderAvatars.length];
                  return <InstructorCard key={instructor.id} instructor={instructor} fallbackImage={fallback} />;
               })}
            </div>

            <div className="after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:h-[240px] after:w-[240px] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[rgba(97,95,255,1))] after:blur-[250px] after:content-['']"></div>
         </div>
      </Section>
   );
};

export default TopInstructors;
