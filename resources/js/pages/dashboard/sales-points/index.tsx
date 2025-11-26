import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Pagination, SharedData } from '@/types/global';
import { Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface Props extends SharedData {
   salesPoints: Pagination<SalesPoint>;
   stats: SalesPointStats;
   filters: {
      search?: string;
      region?: string;
      city?: string;
      status?: string;
   };
   regions: string[];
   cities: string[];
}

const Index = ({ salesPoints, stats, filters, regions, cities, translate }: Props) => {
   const { dashboard, button, table } = translate;
   const [search, setSearch] = useState(filters.search || '');
   const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
   const [selectedCity, setSelectedCity] = useState(filters.city || '');
   const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

   const handleFilter = () => {
      router.get(
         route('sales-points.index'),
         {
            search,
            region: selectedRegion,
            city: selectedCity,
            status: selectedStatus,
         },
         {
            preserveState: true,
            preserveScroll: true,
         }
      );
   };

   const handleReset = () => {
      setSearch('');
      setSelectedRegion('');
      setSelectedCity('');
      setSelectedStatus('');
      router.get(route('sales-points.index'));
   };

   const handleDelete = (id: number) => {
      if (confirm('Are you sure you want to delete this sales point?')) {
         router.delete(route('sales-points.destroy', id));
      }
   };

   const getStatusBadge = (status: string) => {
      return status === 'approved'
         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
         : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
   };

   const openInMaps = (lat: number, lng: number) => {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
   };

   return (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Sales Points Management</h1>
            <Link href={route('sales-points.create')}>
               <Button>{button.create || 'Add Sales Point'}</Button>
            </Link>
         </div>

         {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Total Sales Points</div>
               <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Approved</div>
               <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Disabled</div>
               <div className="text-2xl font-bold text-orange-600">{stats.disabled}</div>
            </Card>
         </div>

         {/* Filters */}
         <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               <div>
                  <Label>Search</Label>
                  <Input
                     type="text"
                     placeholder="Search by name/address..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  />
               </div>
               <div>
                  <Label>Region</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedRegion}
                     onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                     <option value="">All Regions</option>
                     {regions.map((region) => (
                        <option key={region} value={region}>
                           {region}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <Label>City</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedCity}
                     onChange={(e) => setSelectedCity(e.target.value)}
                  >
                     <option value="">All Cities</option>
                     {cities.map((city) => (
                        <option key={city} value={city}>
                           {city}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <Label>Status</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedStatus}
                     onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                     <option value="">All Statuses</option>
                     <option value="approved">Approved</option>
                     <option value="disabled">Disabled</option>
                  </select>
               </div>
               <div className="flex items-end gap-2">
                  <Button onClick={handleFilter} className="flex-1">
                     Filter
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                     Reset
                  </Button>
               </div>
            </div>
         </Card>

         {/* Sales Points Table */}
         <Card className="p-4">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Location</th>
                        <th className="text-left p-3">Contact</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Map</th>
                        <th className="text-left p-3">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {salesPoints.data.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="text-center p-8 text-muted-foreground">
                              No sales points found
                           </td>
                        </tr>
                     ) : (
                        salesPoints.data.map((point: SalesPoint) => (
                           <tr key={point.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                 <div className="font-medium">{point.name}</div>
                                 {point.image && (
                                    <img
                                       src={point.image}
                                       alt={point.name}
                                       className="w-16 h-16 object-cover rounded mt-1"
                                    />
                                 )}
                              </td>
                              <td className="p-3">
                                 <div className="text-sm">
                                    <div>{point.address}</div>
                                    <div className="text-muted-foreground">
                                       {[point.city, point.region, point.country].filter(Boolean).join(', ')}
                                    </div>
                                 </div>
                              </td>
                              <td className="p-3">
                                 <div className="text-sm">
                                    <div>
                                       <a href={`tel:${point.phone}`} className="text-blue-600 hover:underline">
                                          {point.phone}
                                       </a>
                                    </div>
                                    {point.email && (
                                       <div>
                                          <a
                                             href={`mailto:${point.email}`}
                                             className="text-blue-600 hover:underline"
                                          >
                                             {point.email}
                                          </a>
                                       </div>
                                    )}
                                    {point.website && (
                                       <div>
                                          <a
                                             href={point.website}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-blue-600 hover:underline"
                                          >
                                             Website
                                          </a>
                                       </div>
                                    )}
                                 </div>
                              </td>
                              <td className="p-3">
                                 <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(point.status)}`}>
                                    {point.status}
                                 </span>
                              </td>
                              <td className="p-3">
                                 {point.latitude && point.longitude ? (
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => openInMaps(point.latitude!, point.longitude!)}
                                    >
                                       View Map
                                    </Button>
                                 ) : (
                                    <span className="text-xs text-muted-foreground">No coords</span>
                                 )}
                              </td>
                              <td className="p-3">
                                 <div className="flex gap-2">
                                    <Link href={route('sales-points.show', point.id)}>
                                       <Button size="sm" variant="outline">
                                          View
                                       </Button>
                                    </Link>
                                    <Link href={route('sales-points.edit', point.id)}>
                                       <Button size="sm" variant="outline">
                                          Edit
                                       </Button>
                                    </Link>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(typeof point.id === 'string' ? parseInt(point.id) : point.id)}>
                                       Delete
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {salesPoints.last_page > 1 && (
               <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                     Showing {salesPoints.from} to {salesPoints.to} of {salesPoints.total} sales points
                  </div>
                  <div className="flex gap-2">
                     {salesPoints.links.map((link: { url: string | null; label: string; active: boolean }, index: number) => {
                        // Decode HTML entities and strip tags for safer rendering
                        const label = link.label
                           .replace(/&laquo;/g, '«')
                           .replace(/&raquo;/g, '»')
                           .replace(/<[^>]*>/g, '');

                        return (
                           <Button
                              key={index}
                              size="sm"
                              variant={link.active ? 'default' : 'outline'}
                              disabled={!link.url}
                              onClick={() => link.url && router.get(link.url)}
                           >
                              {label}
                           </Button>
                        );
                     })}
                  </div>
               </div>
            )}
         </Card>
      </div>
   );
};

Index.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default Index;
