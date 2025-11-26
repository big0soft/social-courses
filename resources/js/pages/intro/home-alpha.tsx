import { Head } from '@inertiajs/react';
import { IntroPageProps } from '@/types/page';
import Layout from './partials/layout';
import Hero from './partials/home-prime/hero';
import Stats from './partials/home-prime/stats';
import GradeTracks from './partials/home-prime/grades';
import Tutors from './partials/home-prime/tutors';
import Courses from './partials/home-prime/courses';
import Testimonials from './partials/home-prime/testimonials';
import Blogs from './partials/home-prime/blogs';
import FAQs from './partials/home-prime/faqs';
import CTA from './partials/home-prime/cta';

// This component is identical to home-prime but exists as a separate file
// to ensure Vite discovers it as a page entry point
const HomeAlpha = ({ system }: IntroPageProps) => {
   const siteTitle = system?.fields?.name ?? 'Mentor LMS';

   return (
      <Layout>
         <Head title={`${siteTitle} | Home`} />
         <Hero />
         <GradeTracks />
         <Tutors />
         <Stats />
         <Blogs />
         <FAQs />
         <Courses />
         <Testimonials />
         <CTA />
      </Layout>
   );
};

export default HomeAlpha;

