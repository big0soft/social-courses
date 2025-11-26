import Tabs from '@/components/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TabsContent } from '@/components/ui/tabs';
import useScreen from '@/hooks/use-screen';
import LandingLayout from '@/layouts/landing-layout';
import { StudentDashboardProps } from '@/types/page';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, GraduationCap, Heart, ListFilter, LoaderCircle, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { nanoid } from 'nanoid';
import { FormEventHandler, ReactNode, useState } from 'react';
import BecomeInstructor from './partials/become-instructor';
import CardRedemption from './partials/card-redemption';
import MyCourses from './partials/my-courses';
import MyProfile from './partials/my-profile';
import Settings from './partials/settings';
import TabLists from './partials/tab-lists';
import Wishlist from './partials/wishlist';

const Index = (props: StudentDashboardProps) => {
   const { screen } = useScreen();
   const [open, setOpen] = useState(false);
   const { instructor, enrollments, wishlists, hasVerifiedEmail, status, translate, rtl } = props;
   const { button, frontend, auth } = translate;

   const tabs = [
      {
         id: nanoid(),
         name: button.courses,
         slug: 'courses',
         Icon: GraduationCap,
         Component: enrollments ? <MyCourses enrollments={enrollments} /> : <></>,
      },
      {
         id: nanoid(),
         name: button.wishlist,
         slug: 'wishlist',
         Icon: Heart,
         Component: wishlists ? <Wishlist wishlists={wishlists} /> : <></>,
      },
      {
         id: nanoid(),
         name: 'Redeem Card',
         slug: 'redeem',
         Icon: CreditCard,
         Component: <CardRedemption />,
      },
      {
         id: nanoid(),
         name: button.profile,
         slug: 'profile',
         Icon: UserCircle,
         Component: <MyProfile />,
      },
      {
         id: nanoid(),
         name: button.settings,
         slug: 'settings',
         Icon: SettingsIcon,
         Component: <Settings />,
      },
   ];

   const { post, processing } = useForm({});

   const submit: FormEventHandler = (e) => {
      e.preventDefault();

      post(route('verification.send'));
   };

   return (
      <div className="container py-6">
         <Head title={frontend.student_dashboard} />

         <Tabs value={props.tab} defaultValue={tabs[0].slug} className="flex items-start gap-6 lg:gap-10">
            {screen > 768 && (
               <Card className="sticky top-24 w-full max-w-[270px] border-none p-4">
                  <TabLists tabs={tabs} />
               </Card>
            )}

            <div className="w-full">
               {!hasVerifiedEmail && (
                  <div className="mb-6 rounded-md bg-red-50 p-6">
                     {status === 'verification-link-sent' ? (
                        <p className="mb-4 text-center text-sm font-medium text-green-600">{auth.verification_sent}</p>
                     ) : (
                        <p className="mb-4 text-center text-sm font-medium text-red-500">{frontend.email_not_verified}</p>
                     )}

                     <form onSubmit={submit} className="flex items-center justify-center gap-4 text-center">
                        <Button disabled={processing} variant="secondary">
                           {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                           {button.submit}
                        </Button>

                        <Button onClick={() => router.post(route('logout'))}>{button.logout}</Button>
                     </form>
                  </div>
               )}

               {tabs.map(({ id, name, slug, Component }) => (
                  <TabsContent key={id} value={slug} className="m-0">
                     <div className="mb-6 flex items-center gap-2">
                        {screen < 768 && (
                           <Sheet open={open} onOpenChange={setOpen}>
                              <SheetTrigger asChild>
                                 <Button size="icon" variant="outline">
                                    <ListFilter className="h-5 w-5" />
                                 </Button>
                              </SheetTrigger>

                              <SheetContent side="left" className="border-border w-[230px]">
                                 <ScrollArea className="h-full">
                                    <TabLists tabs={tabs} />
                                 </ScrollArea>
                              </SheetContent>
                           </Sheet>
                        )}

                        <h2 className="text-2xl font-bold">{name}</h2>
                     </div>
                     {Component}
                  </TabsContent>
               ))}

               {(!instructor || (instructor && instructor.status !== 'approved')) && (
                  <TabsContent value="instructor" className="m-0">
                     <div className="mb-6 flex items-center gap-2">
                        {screen < 768 && (
                           <Sheet open={open} onOpenChange={setOpen}>
                              <SheetTrigger asChild>
                                 <Button size="icon" variant="outline">
                                    <ListFilter className="h-5 w-5" />
                                 </Button>
                              </SheetTrigger>

                              <SheetContent side="left" className="border-border w-[230px]">
                                 <ScrollArea className="h-full">
                                    <TabLists tabs={tabs} />
                                 </ScrollArea>
                              </SheetContent>
                           </Sheet>
                        )}

                        <h2 className="text-2xl font-bold">{button.become_instructor}</h2>
                     </div>

                     <BecomeInstructor instructor={instructor} />
                  </TabsContent>
               )}
            </div>
         </Tabs>
      </div>
   );
};

Index.layout = (page: ReactNode) => <LandingLayout children={page} customizable={false} language={true} />;

export default Index;
