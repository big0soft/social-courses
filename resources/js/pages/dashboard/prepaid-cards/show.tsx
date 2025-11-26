import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { SharedData } from '@/types/global';
import { router } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props extends SharedData {
   card: PrepaidCard;
}

const ShowPrepaidCard = ({ card, translate }: Props) => {
   const { dashboard } = translate;

   return (
      <div>
         <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Prepaid Card Details</h1>
            <div className="flex gap-2">
               <Button variant="outline" onClick={() => router.visit(route('prepaid-cards.edit', card.id))}>
                  Edit Card
               </Button>
               <Button variant="outline" onClick={() => router.visit(route('prepaid-cards.index'))}>
                  Back to Cards
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Card Info */}
            <div className="lg:col-span-2 space-y-6">
               <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Card Information</h2>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="text-sm text-muted-foreground">Card Code</span>
                           <p className="font-mono text-lg font-semibold mt-1">{card.code}</p>
                        </div>
                        <div>
                           <span className="text-sm text-muted-foreground">Status</span>
                           <div className="mt-1">
                              <span
                                 className={`text-xs px-2 py-1 rounded-full ${
                                    card.status === 'active'
                                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                       : card.status === 'used'
                                       ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                       : card.status === 'expired'
                                       ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                       : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                 }`}
                              >
                                 {card.status}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="text-sm text-muted-foreground">Card Type</span>
                           <p className="font-medium mt-1">
                              {card.card_type === 'single_course' ? 'Single Course' : 'Course Bundle'}
                           </p>
                        </div>
                        <div>
                           <span className="text-sm text-muted-foreground">Price</span>
                           <p className="font-medium mt-1">
                              {card.price} {card.currency}
                           </p>
                        </div>
                     </div>

                     {card.batch_id && (
                        <div>
                           <span className="text-sm text-muted-foreground">Batch ID</span>
                           <p className="font-mono font-medium mt-1">{card.batch_id}</p>
                        </div>
                     )}

                     {card.expires_at && (
                        <div>
                           <span className="text-sm text-muted-foreground">Expiration Date</span>
                           <p className="font-medium mt-1">{new Date(card.expires_at).toLocaleDateString()}</p>
                        </div>
                     )}
                  </div>
               </Card>

               {/* Course Information */}
               <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Course Details</h2>
                  {card.card_type === 'single_course' && card.course ? (
                     <div>
                        <div className="p-4 bg-muted rounded-lg">
                           <h3 className="font-semibold text-lg">{card.course.title}</h3>
                           <p className="text-sm text-muted-foreground mt-1">
                              Course ID: {card.course.id}
                           </p>
                        </div>
                     </div>
                  ) : card.card_type === 'bundle' ? (
                     <div className="space-y-4">
                        {card.title && (
                           <div>
                              <span className="text-sm text-muted-foreground">Bundle Title</span>
                              <p className="font-semibold text-lg mt-1">{card.title}</p>
                           </div>
                        )}
                        {card.description && (
                           <div>
                              <span className="text-sm text-muted-foreground">Description</span>
                              <p className="text-sm mt-1">{card.description}</p>
                           </div>
                        )}
                        <div>
                           <span className="text-sm text-muted-foreground mb-2 block">
                              Included Courses ({card.bundleCourses?.length || 0})
                           </span>
                           <div className="space-y-2">
                              {card.bundleCourses?.map((course, index) => (
                                 <div key={course.id} className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-start gap-2">
                                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                                          {index + 1}
                                       </span>
                                       <div className="flex-1">
                                          <p className="font-medium">{course.title}</p>
                                          <p className="text-xs text-muted-foreground">ID: {course.id}</p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  ) : (
                     <p className="text-muted-foreground">No course information available</p>
                  )}
               </Card>

               {/* Usage Information */}
               {card.status === 'used' && (
                  <Card className="p-6">
                     <h2 className="text-lg font-semibold mb-4">Redemption Details</h2>
                     <div className="space-y-4">
                        {card.usedByUser ? (
                           <div>
                              <span className="text-sm text-muted-foreground">Redeemed By</span>
                              <div className="mt-1 p-3 bg-muted rounded-lg">
                                 <p className="font-medium">{card.usedByUser.name}</p>
                                 <p className="text-sm text-muted-foreground">{card.usedByUser.email}</p>
                              </div>
                           </div>
                        ) : card.activation?.user ? (
                           <div>
                              <span className="text-sm text-muted-foreground">Redeemed By</span>
                              <div className="mt-1 p-3 bg-muted rounded-lg">
                                 <p className="font-medium">{card.activation.user.name}</p>
                                 <p className="text-sm text-muted-foreground">{card.activation.user.email}</p>
                              </div>
                           </div>
                        ) : (
                           <div>
                              <span className="text-sm text-muted-foreground">Redeemed By</span>
                              <p className="text-sm text-muted-foreground mt-1">User information not available</p>
                           </div>
                        )}
                        {card.used_at ? (
                           <div>
                              <span className="text-sm text-muted-foreground">Redeemed At</span>
                              <p className="font-medium mt-1">{new Date(card.used_at).toLocaleString()}</p>
                           </div>
                        ) : card.activation?.activated_at ? (
                           <div>
                              <span className="text-sm text-muted-foreground">Redeemed At</span>
                              <p className="font-medium mt-1">{new Date(card.activation.activated_at).toLocaleString()}</p>
                           </div>
                        ) : null}
                        {card.activation && (
                           <>
                              {card.activation.ip_address && (
                                 <div>
                                    <span className="text-sm text-muted-foreground">IP Address</span>
                                    <p className="font-mono text-sm mt-1">{card.activation.ip_address}</p>
                                 </div>
                              )}
                              {card.activation.user_agent && (
                                 <div>
                                    <span className="text-sm text-muted-foreground">User Agent</span>
                                    <p className="text-xs text-muted-foreground mt-1 break-all">
                                       {card.activation.user_agent}
                                    </p>
                                 </div>
                              )}
                           </>
                        )}
                     </div>
                  </Card>
               )}

               {/* Notes */}
               {card.notes && (
                  <Card className="p-6">
                     <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
                     <p className="text-sm whitespace-pre-wrap">{card.notes}</p>
                  </Card>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
               <Card className="p-6">
                  <h3 className="font-semibold mb-3">Card Timeline</h3>
                  <div className="space-y-3">
                     <div>
                        <span className="text-xs text-muted-foreground">Created</span>
                        <p className="text-sm font-medium">{new Date(card.created_at).toLocaleString()}</p>
                        {card.creator && (
                           <p className="text-xs text-muted-foreground mt-1">by {card.creator.name}</p>
                        )}
                     </div>
                     {card.updated_at && card.updated_at !== card.created_at && (
                        <div>
                           <span className="text-xs text-muted-foreground">Last Updated</span>
                           <p className="text-sm font-medium">{new Date(card.updated_at).toLocaleString()}</p>
                        </div>
                     )}
                  </div>
               </Card>

               <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                  <div className="space-y-2">
                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.visit(route('prepaid-cards.edit', card.id))}
                     >
                        Edit Card
                     </Button>
                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.visit(route('prepaid-cards.statistics'))}
                     >
                        View Statistics
                     </Button>
                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                           navigator.clipboard.writeText(card.code);
                           alert('Card code copied to clipboard!');
                        }}
                     >
                        Copy Card Code
                     </Button>
                  </div>
               </Card>

               {card.status === 'active' && !card.expires_at && (
                  <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                     <h3 className="font-semibold mb-2 text-green-800 dark:text-green-300">Ready to Use</h3>
                     <p className="text-sm text-green-700 dark:text-green-400">
                        This card is active and can be redeemed at any time.
                     </p>
                  </Card>
               )}

               {card.expires_at && new Date(card.expires_at) < new Date() && (
                  <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900">
                     <h3 className="font-semibold mb-2 text-red-800 dark:text-red-300">Expired</h3>
                     <p className="text-sm text-red-700 dark:text-red-400">
                        This card expired on {new Date(card.expires_at).toLocaleDateString()}.
                     </p>
                  </Card>
               )}
            </div>
         </div>
      </div>
   );
};

ShowPrepaidCard.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default ShowPrepaidCard;
