import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard/layout';
import { onHandleChange } from '@/lib/inertia';
import { SharedData } from '@/types/global';
import { Link, useForm } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props extends SharedData {
   salesPoint?: SalesPoint;
   regions: string[];
   cities: string[];
}

const Form = ({ salesPoint, regions, cities, translate }: Props) => {
   const { dashboard, input, button } = translate;
   const isEditing = !!salesPoint;

   const { data, setData, post, put, processing, errors } = useForm({
      name: salesPoint?.name || '',
      address: salesPoint?.address || '',
      region: salesPoint?.region || '',
      city: salesPoint?.city || '',
      country: salesPoint?.country || 'Iraq',
      latitude: salesPoint?.latitude?.toString() || '',
      longitude: salesPoint?.longitude?.toString() || '',
      phone: salesPoint?.phone || '',
      email: salesPoint?.email || '',
      website: salesPoint?.website || '',
      description: salesPoint?.description || '',
      status: salesPoint?.status || 'approved',
      notes: salesPoint?.notes || '',
      image: null as File | null,
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (isEditing) {
         put(route('sales-points.update', salesPoint.id));
      } else {
         post(route('sales-points.store'));
      }
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         setData('image', e.target.files[0]);
      }
   };

   return (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Sales Point' : 'Create Sales Point'}</h1>
            <Link href={route('sales-points.index')}>
               <Button variant="outline">Back to List</Button>
            </Link>
         </div>

         <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Basic Information */}
               <div>
                  <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                        <Label>Name *</Label>
                        <Input
                           type="text"
                           name="name"
                           value={data.name}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="e.g., Al-Mutanabbi Bookstore"
                        />
                        <InputError message={errors.name} />
                     </div>

                     <div className="md:col-span-2">
                        <Label>Address *</Label>
                        <Input
                           type="text"
                           name="address"
                           value={data.address}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="Street address"
                        />
                        <InputError message={errors.address} />
                     </div>

                     <div>
                        <Label>Region</Label>
                        <Input
                           type="text"
                           name="region"
                           value={data.region}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="e.g., Baghdad Province"
                           list="regions-list"
                        />
                        <datalist id="regions-list">
                           {regions.map((region) => (
                              <option key={region} value={region} />
                           ))}
                        </datalist>
                        <InputError message={errors.region} />
                     </div>

                     <div>
                        <Label>City</Label>
                        <Input
                           type="text"
                           name="city"
                           value={data.city}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="e.g., Baghdad"
                           list="cities-list"
                        />
                        <datalist id="cities-list">
                           {cities.map((city) => (
                              <option key={city} value={city} />
                           ))}
                        </datalist>
                        <InputError message={errors.city} />
                     </div>

                     <div>
                        <Label>Country *</Label>
                        <Input
                           type="text"
                           name="country"
                           value={data.country}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="Iraq"
                        />
                        <InputError message={errors.country} />
                     </div>

                     <div>
                        <Label>Status *</Label>
                        <select
                           name="status"
                           value={data.status}
                           onChange={(e) => setData('status', e.target.value as 'approved' | 'disabled')}
                           className="w-full border rounded-md p-2"
                        >
                           <option value="approved">Approved</option>
                           <option value="disabled">Disabled</option>
                        </select>
                        <InputError message={errors.status} />
                     </div>
                  </div>
               </div>

               {/* Contact Information */}
               <div>
                  <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label>Phone *</Label>
                        <Input
                           type="tel"
                           name="phone"
                           value={data.phone}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="+964XXXXXXXXXX"
                        />
                        <InputError message={errors.phone} />
                     </div>

                     <div>
                        <Label>Email</Label>
                        <Input
                           type="email"
                           name="email"
                           value={data.email}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="contact@example.com"
                        />
                        <InputError message={errors.email} />
                     </div>

                     <div className="md:col-span-2">
                        <Label>Website</Label>
                        <Input
                           type="url"
                           name="website"
                           value={data.website}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="https://example.com"
                        />
                        <InputError message={errors.website} />
                     </div>
                  </div>
               </div>

               {/* Location Coordinates */}
               <div>
                  <h2 className="text-lg font-semibold mb-4">Location Coordinates (Optional)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label>Latitude</Label>
                        <Input
                           type="text"
                           name="latitude"
                           value={data.latitude}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="33.3152"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                           Leave empty to auto-geocode from address
                        </p>
                        <InputError message={errors.latitude} />
                     </div>

                     <div>
                        <Label>Longitude</Label>
                        <Input
                           type="text"
                           name="longitude"
                           value={data.longitude}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="44.3661"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                           Leave empty to auto-geocode from address
                        </p>
                        <InputError message={errors.longitude} />
                     </div>
                  </div>
               </div>

               {/* Description and Image */}
               <div>
                  <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
                  <div className="space-y-4">
                     <div>
                        <Label>Description</Label>
                        <Textarea
                           rows={4}
                           name="description"
                           value={data.description}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="Describe the sales point..."
                        />
                        <InputError message={errors.description} />
                     </div>

                     <div>
                        <Label>Admin Notes</Label>
                        <Textarea
                           rows={3}
                           name="notes"
                           value={data.notes}
                           onChange={(e) => onHandleChange(e, setData)}
                           placeholder="Internal notes about this sales point..."
                        />
                        <InputError message={errors.notes} />
                     </div>

                     <div>
                        <Label>Image</Label>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                        {salesPoint?.image && (
                           <div className="mt-2">
                              <img src={salesPoint.image} alt={salesPoint.name} className="w-32 h-32 object-cover rounded" />
                           </div>
                        )}
                        <InputError message={errors.image} />
                     </div>
                  </div>
               </div>

               {/* Submit Button */}
               <div className="flex gap-2 pt-4 border-t">
                  <LoadingButton loading={processing}>
                     {button.submit || (isEditing ? 'Update Sales Point' : 'Create Sales Point')}
                  </LoadingButton>
                  <Link href={route('sales-points.index')}>
                     <Button type="button" variant="outline">
                        Cancel
                     </Button>
                  </Link>
               </div>
            </form>
         </Card>
      </div>
   );
};

Form.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default Form;
