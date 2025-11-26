import BlogCard1 from '@/components/cards/blog-card-1';
import { getPageSection } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { usePage } from '@inertiajs/react';
import Section from '../../partials/section';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Newspaper } from 'lucide-react';

const Blogs = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, blogs = [], direction } = props;
   const blogSection = getPageSection(page, 'blogs');
   const isRTL = direction === 'rtl';

   return (
      <Section customize={customize} pageSection={blogSection} containerClass="py-16">
         <div className={cn('mb-8', isRTL ? 'text-right' : 'text-center')}>
            <div className={cn('mb-4 flex items-center gap-2', isRTL ? 'justify-end' : 'justify-center')}>
               <Newspaper className="h-5 w-5 text-primary" />
               <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
                  {blogSection?.title || (isRTL ? 'آخر الأخبار' : 'Latest News')}
               </p>
            </div>
            <h2 className="mt-2 text-3xl font-semibold">{blogSection?.sub_title || (isRTL ? 'تعرف على أخبار ألفا' : 'Learn about Alpha News')}</h2>
            <p className="mt-2 text-muted-foreground">{blogSection?.description}</p>
         </div>

         {blogs.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               {isRTL ? 'ستظهر المقالات المنشورة هنا بمجرد تثبيت منشورات المدونة' : 'Published articles will surface here once blog posts are pinned.'}
            </div>
         ) : (
            <>
               <div className="grid gap-6 md:grid-cols-2">
                  {blogs.slice(0, 4).map((blog) => (
                     <BlogCard1 key={blog.id} blog={blog} />
                  ))}
               </div>
               <div className={cn('mt-8 flex', isRTL ? 'justify-end' : 'justify-center')}>
                  <Button asChild variant="outline" className="rounded-full px-6 py-6 text-sm font-semibold">
                     <Link href="/blogs">{isRTL ? 'جميع الأخبار' : 'All News'}</Link>
                  </Button>
               </div>
            </>
         )}
      </Section>
   );
};

export default Blogs;
