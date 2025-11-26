import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard/layout';
import { SharedData } from '@/types/global';
import { router, useForm } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props extends SharedData {
   card: PrepaidCard;
   courses: Array<{ id: number; title: string; price: number }>;
   cardTypes: Array<{ value: string; label: string }>;
}

const EditPrepaidCard = ({ card, courses, cardTypes, translate }: Props) => {
   const { dashboard } = translate;

   const { data, setData, put, processing, errors } = useForm({
      status: card.status,
      expires_at: card.expires_at || '',
      notes: card.notes || '',
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      put(route('prepaid-cards.update', card.id));
   };

   const handleDelete = () => {
      if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
         router.delete(route('prepaid-cards.destroy', card.id));
      }
   };

   return (
      <div>
         <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Prepaid Card</h1>
            <Button variant="outline" onClick={() => router.visit(route('prepaid-cards.index'))}>
               Back to Cards
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Details (Read-only) */}
            <div className="lg:col-span-2 space-y-6">
               <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Card Information</h2>
                  <div className="space-y-4">
                     <div>
                        <Label>Card Code</Label>
                        <Input
                           value={card.code}
                           disabled
                           className="font-mono text-lg bg-muted"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                           Card codes cannot be changed after creation
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label>Card Type</Label>
                           <Input
                              value={card.card_type === 'single_course' ? 'Single Course' : 'Bundle'}
                              disabled
                              className="bg-muted"
                           />
                        </div>
                        <div>
                           <Label>Price</Label>
                           <Input
                              value={`${card.price} ${card.currency}`}
                              disabled
                              className="bg-muted"
                           />
                        </div>
                     </div>

                     {card.card_type === 'single_course' && card.course && (
                        <div>
                           <Label>Course</Label>
                           <Input
                              value={card.course.title}
                              disabled
                              className="bg-muted"
                           />
                        </div>
                     )}

                     {card.card_type === 'bundle' && (
                        <>
                           <div>
                              <Label>Bundle Title</Label>
                              <Input
                                 value={card.title || ''}
                                 disabled
                                 className="bg-muted"
                              />
                           </div>
                           <div>
                              <Label>Included Courses</Label>
                              <div className="bg-muted rounded-md p-3 space-y-2">
                                 {card.bundleCourses?.map((course) => (
                                    <div key={course.id} className="text-sm">
                                       • {course.title}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </>
                     )}

                     <div>
                        <Label>Created By</Label>
                        <Input
                           value={card.creator?.name || 'Unknown'}
                           disabled
                           className="bg-muted"
                        />
                     </div>

                     <div>
                        <Label>Created At</Label>
                        <Input
                           value={new Date(card.created_at).toLocaleString()}
                           disabled
                           className="bg-muted"
                        />
                     </div>

                     {card.used_by && card.usedByUser && (
                        <>
                           <div>
                              <Label>Redeemed By</Label>
                              <Input
                                 value={`${card.usedByUser.name} (${card.usedByUser.email})`}
                                 disabled
                                 className="bg-muted"
                              />
                           </div>
                           <div>
                              <Label>Redeemed At</Label>
                              <Input
                                 value={card.used_at ? new Date(card.used_at).toLocaleString() : 'N/A'}
                                 disabled
                                 className="bg-muted"
                              />
                           </div>
                        </>
                     )}
                  </div>
               </Card>

               {/* Editable Fields */}
               <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Update Card Settings</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <Label>Status *</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'used' | 'expired' | 'disabled')}>
                           <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                           </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                        {card.status === 'used' && (
                           <p className="text-sm text-orange-600 mt-1">
                              ⚠️ This card has already been redeemed and cannot be used again
                           </p>
                        )}
                     </div>

                     <div>
                        <Label>Expiration Date</Label>
                        <Input
                           type="date"
                           value={data.expires_at}
                           onChange={(e) => setData('expires_at', e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                           Leave empty for no expiration
                        </p>
                        <InputError message={errors.expires_at} />
                     </div>

                     <div>
                        <Label>Internal Notes</Label>
                        <Textarea
                           value={data.notes}
                           onChange={(e) => setData('notes', e.target.value)}
                           rows={4}
                           placeholder="Add any internal notes about this card..."
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                           These notes are for internal use only and not visible to students
                        </p>
                        <InputError message={errors.notes} />
                     </div>

                     <div className="flex gap-2 pt-4">
                        <LoadingButton loading={processing}>
                           Update Card
                        </LoadingButton>
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => router.visit(route('prepaid-cards.index'))}
                        >
                           Cancel
                        </Button>
                     </div>
                  </form>
               </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
               <Card className="p-6">
                  <h3 className="font-semibold mb-3">Card Status</h3>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Status:</span>
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
                     {card.batch_id && (
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-muted-foreground">Batch ID:</span>
                           <span className="text-sm font-mono">{card.batch_id}</span>
                        </div>
                     )}
                  </div>
               </Card>

               {card.status !== 'used' && (
                  <Card className="p-6 border-red-200 dark:border-red-900">
                     <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">Danger Zone</h3>
                     <p className="text-sm text-muted-foreground mb-4">
                        Delete this card permanently. This action cannot be undone.
                     </p>
                     <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="w-full"
                     >
                        Delete Card
                     </Button>
                  </Card>
               )}

               <Card className="p-6">
                  <h3 className="font-semibold mb-2 text-sm">Quick Actions</h3>
                  <div className="space-y-2">
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
                        onClick={() => router.visit(route('prepaid-cards.create'))}
                     >
                        Generate New Cards
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
};

EditPrepaidCard.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default EditPrepaidCard;
