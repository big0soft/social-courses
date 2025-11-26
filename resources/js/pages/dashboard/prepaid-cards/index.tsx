import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Pagination, SharedData } from '@/types/global';
import { Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface Props extends SharedData {
   cards: Pagination<PrepaidCard>;
   stats: CardStatistics;
   filters: {
      search?: string;
      status?: string;
      card_type?: string;
      batch_id?: string;
   };
   batches: CardBatch[];
}

const Index = ({ cards, stats, filters, batches, translate }: Props) => {
   const { dashboard, button, table } = translate;
   const [search, setSearch] = useState(filters.search || '');
   const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
   const [selectedType, setSelectedType] = useState(filters.card_type || '');
   const [selectedBatch, setSelectedBatch] = useState(filters.batch_id || '');

   const handleFilter = () => {
      router.get(
         route('prepaid-cards.index'),
         {
            search,
            status: selectedStatus,
            card_type: selectedType,
            batch_id: selectedBatch,
         },
         {
            preserveState: true,
            preserveScroll: true,
         }
      );
   };

   const handleReset = () => {
      setSearch('');
      setSelectedStatus('');
      setSelectedType('');
      setSelectedBatch('');
      router.get(route('prepaid-cards.index'));
   };

   const handleDelete = (id: number) => {
      if (confirm('Are you sure you want to delete this card?')) {
         router.delete(route('prepaid-cards.destroy', id));
      }
   };

   const handleExport = () => {
      window.location.href = route('prepaid-cards.export');
   };

   const getStatusBadge = (status: string) => {
      const badges = {
         active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
         used: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
         expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
         disabled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      };
      return badges[status as keyof typeof badges] || badges.active;
   };

   const getTypeBadge = (type: string) => {
      return type === 'single_course'
         ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
         : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
   };

   return (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Prepaid Cards Management</h1>
            <div className="flex gap-2">
               <Button onClick={handleExport} variant="outline">
                  Export CSV
               </Button>
               <Link href={route('prepaid-cards.create')}>
                  <Button>{button.create || 'Generate Cards'}</Button>
               </Link>
            </div>
         </div>

         {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Total Cards</div>
               <div className="text-2xl font-bold">{stats.total_cards}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Active</div>
               <div className="text-2xl font-bold text-green-600">{stats.active_cards}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Used</div>
               <div className="text-2xl font-bold text-gray-600">{stats.used_cards}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Expired</div>
               <div className="text-2xl font-bold text-red-600">{stats.expired_cards}</div>
            </Card>
            <Card className="p-4">
               <div className="text-sm text-muted-foreground">Total Value</div>
               <div className="text-2xl font-bold">${stats.total_value.toLocaleString()}</div>
            </Card>
         </div>

         {/* Filters */}
         <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               <div>
                  <Label>Search</Label>
                  <Input
                     type="text"
                     placeholder="Search by code..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  />
               </div>
               <div>
                  <Label>Status</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedStatus}
                     onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                     <option value="">All Statuses</option>
                     <option value="active">Active</option>
                     <option value="used">Used</option>
                     <option value="expired">Expired</option>
                     <option value="disabled">Disabled</option>
                  </select>
               </div>
               <div>
                  <Label>Card Type</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedType}
                     onChange={(e) => setSelectedType(e.target.value)}
                  >
                     <option value="">All Types</option>
                     <option value="single_course">Single Course</option>
                     <option value="bundle">Bundle</option>
                  </select>
               </div>
               <div>
                  <Label>Batch</Label>
                  <select
                     className="w-full border rounded-md p-2"
                     value={selectedBatch}
                     onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                     <option value="">All Batches</option>
                     {batches.map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                           {batch.batch_id} ({batch.count} cards)
                        </option>
                     ))}
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

         {/* Cards Table */}
         <Card className="p-4">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b">
                        <th className="text-left p-3">Code</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Course/Title</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Expires</th>
                        <th className="text-left p-3">Created</th>
                        <th className="text-left p-3">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {cards.data.length === 0 ? (
                        <tr>
                           <td colSpan={8} className="text-center p-8 text-muted-foreground">
                              No cards found
                           </td>
                        </tr>
                     ) : (
                        cards.data.map((card: PrepaidCard) => (
                           <tr key={card.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                 <code className="text-xs bg-muted px-2 py-1 rounded">{card.code}</code>
                              </td>
                              <td className="p-3">
                                 <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadge(card.card_type)}`}>
                                    {card.card_type === 'single_course' ? 'Single' : 'Bundle'}
                                 </span>
                              </td>
                              <td className="p-3">
                                 {card.card_type === 'single_course' ? (
                                    <span>{card.course?.title || 'N/A'}</span>
                                 ) : (
                                    <div>
                                       <div className="font-medium">{card.title}</div>
                                       <div className="text-xs text-muted-foreground">
                                          {card.bundleCourses?.length || 0} courses
                                       </div>
                                    </div>
                                 )}
                              </td>
                              <td className="p-3">
                                 <span className="font-medium">
                                    {card.price} {card.currency}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(card.status)}`}>
                                    {card.status}
                                 </span>
                              </td>
                              <td className="p-3">
                                 {card.expires_at ? (
                                    <span className="text-sm">
                                       {new Date(card.expires_at).toLocaleDateString()}
                                    </span>
                                 ) : (
                                    <span className="text-muted-foreground">Never</span>
                                 )}
                              </td>
                              <td className="p-3">
                                 <span className="text-sm">
                                    {new Date(card.created_at).toLocaleDateString()}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <div className="flex gap-2">
                                    <Link href={route('prepaid-cards.show', card.id)}>
                                       <Button size="sm" variant="outline">
                                          View
                                       </Button>
                                    </Link>
                                    <Link href={route('prepaid-cards.edit', card.id)}>
                                       <Button size="sm" variant="outline">
                                          Edit
                                       </Button>
                                    </Link>
                                    <Button
                                       size="sm"
                                       variant="destructive"
                                       onClick={() => handleDelete(typeof card.id === 'string' ? parseInt(card.id) : card.id)}
                                    >
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
            {cards.last_page > 1 && (
               <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                     Showing {cards.from} to {cards.to} of {cards.total} cards
                  </div>
                  <div className="flex gap-2">
                     {cards.links.map((link: { url: string | null; label: string; active: boolean }, index: number) => {
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
