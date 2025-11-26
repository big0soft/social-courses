import Combobox from '@/components/combobox';
import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard/layout';
import { onHandleChange } from '@/lib/inertia';
import { SharedData } from '@/types/global';
import { useForm } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface Props extends SharedData {
   courses: Array<{ id: number; title: string; price: number }>;
   cardTypes: Array<{ value: string; label: string }>;
}

// Constants for card generation limits
const MIN_CARDS_PER_BATCH = 1;
const MAX_CARDS_PER_BATCH = 1000;

const Create = ({ courses, cardTypes, translate }: Props) => {
   const { dashboard, input, button } = translate;
   const [selectedType, setSelectedType] = useState<'single_course' | 'bundle'>('single_course');

   const { data, setData, post, processing, errors, reset } = useForm({
      card_type: 'single_course',
      course_id: '',
      course_ids: [] as string[],
      title: '',
      description: '',
      price: '',
      currency: 'USD',
      quantity: '1',
      expires_at: '',
      notes: '',
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      post(route('prepaid-cards.store'), {
         onSuccess: () => {
            reset();
         },
      });
   };

   const transformedCourses = courses.map((course) => ({
      value: course.id.toString(),
      label: `${course.title} ($${course.price})`,
   }));

   const handleTypeChange = (value: string) => {
      const newType = value as 'single_course' | 'bundle';
      setSelectedType(newType);
      setData('card_type', value);

      // Clear type-specific fields when switching
      if (newType === 'single_course') {
         setData({
            ...data,
            card_type: value,
            course_ids: [],
            title: '',
            description: '',
         });
      } else {
         setData({
            ...data,
            card_type: value,
            course_id: '',
         });
      }
   };

   return (
      <div>
         <h1 className="text-2xl font-bold mb-6">Generate Prepaid Cards</h1>

         <Card className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="relative space-y-4">
               {/* Card Type */}
               <div>
                  <Label>Card Type *</Label>
                  <RadioGroup value={data.card_type} onValueChange={handleTypeChange} className="flex gap-4 mt-2">
                     {cardTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                           <RadioGroupItem value={type.value} id={type.value} />
                           <Label htmlFor={type.value} className="cursor-pointer">
                              {type.label}
                           </Label>
                        </div>
                     ))}
                  </RadioGroup>
                  <InputError message={errors.card_type} />
               </div>

               {/* Single Course Selection */}
               {selectedType === 'single_course' && (
                  <div>
                     <Label>Select Course *</Label>
                     <Combobox
                        data={transformedCourses}
                        placeholder="Select a course"
                        onSelect={(selected) => setData('course_id', selected.value)}
                     />
                     <InputError message={errors.course_id} />
                  </div>
               )}

               {/* Bundle Courses Selection */}
               {selectedType === 'bundle' && (
                  <>
                     <div>
                        <Label>Bundle Title *</Label>
                        <Input
                           type="text"
                           name="title"
                           value={data.title}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="e.g., Complete Web Development Bundle"
                        />
                        <InputError message={errors.title} />
                     </div>

                     <div>
                        <Label>Bundle Description</Label>
                        <Textarea
                           rows={3}
                           name="description"
                           value={data.description}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="Describe the bundle..."
                        />
                        <InputError message={errors.description} />
                     </div>

                     <div>
                        <Label>Select Courses for Bundle * (Multi-select)</Label>
                        <select
                           multiple
                           className="w-full border rounded-md p-2 min-h-[120px]"
                           onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                              setData('course_ids', selected);
                           }}
                        >
                           {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                 {course.title} (${course.price})
                              </option>
                           ))}
                        </select>
                        <p className="text-sm text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple courses</p>
                        <InputError message={errors.course_ids} />
                     </div>
                  </>
               )}

               {/* Price */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label>Price *</Label>
                     <Input
                        type="number"
                        step="0.01"
                        name="price"
                        value={data.price}
                        onChange={(e) => onHandleChange(e, setData)}
                        placeholder="50.00"
                     />
                     <InputError message={errors.price} />
                  </div>

                  <div>
                     <Label>Currency</Label>
                     <select
                        name="currency"
                        value={data.currency}
                        onChange={(e) => setData('currency', e.target.value)}
                        className="w-full border rounded-md p-2"
                     >
                        <option value="USD">USD</option>
                        <option value="IQD">IQD</option>
                        <option value="EUR">EUR</option>
                     </select>
                     <InputError message={errors.currency} />
                  </div>
               </div>

               {/* Quantity */}
               <div>
                  <Label>Quantity ({MIN_CARDS_PER_BATCH}-{MAX_CARDS_PER_BATCH}) *</Label>
                  <Input
                     type="number"
                     min={MIN_CARDS_PER_BATCH}
                     max={MAX_CARDS_PER_BATCH}
                     name="quantity"
                     value={data.quantity}
                     onChange={(e) => onHandleChange(e, setData)}
                     placeholder={MIN_CARDS_PER_BATCH.toString()}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                     Generate multiple cards at once. Each will have a unique code.
                  </p>
                  <InputError message={errors.quantity} />
               </div>

               {/* Expiration Date */}
               <div>
                  <Label>Expiration Date (Optional)</Label>
                  <Input type="date" name="expires_at" value={data.expires_at} onChange={(e) => onHandleChange(e, setData)} />
                  <p className="text-sm text-muted-foreground mt-1">Leave empty for no expiration</p>
                  <InputError message={errors.expires_at} />
               </div>

               {/* Notes */}
               <div className="pb-3">
                  <Label>Admin Notes (Optional)</Label>
                  <Textarea
                     rows={3}
                     name="notes"
                     value={data.notes}
                     onChange={(e) => onHandleChange(e, setData)}
                     placeholder="Internal notes about this card batch..."
                  />
                  <InputError message={errors.notes} />
               </div>

               <LoadingButton loading={processing} className="mt-2">
                  {button.submit || 'Generate Cards'}
               </LoadingButton>
            </form>
         </Card>
      </div>
   );
};

Create.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default Create;
