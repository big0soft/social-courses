import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/layouts/dashboard/layout';
import { onHandleChange } from '@/lib/inertia';
import { cn } from '@/lib/utils';
import { AdsPageProps } from '@/types/page';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

type AdFormData = {
   title: string;
   tagline: string;
   cta_label: string;
   cta_url: string;
   image: string;
   image_file: File | null;
   display_order: number;
   is_active: boolean;
   starts_at: string;
   ends_at: string;
};

const formatDateTime = (value?: string | null) => {
   if (!value) return '—';

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) {
      return '—';
   }

   return date.toLocaleString();
};

const formatForInput = (value?: string | null) => {
   if (!value) return '';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '';

   const pad = (num: number) => num.toString().padStart(2, '0');
   const yyyy = date.getFullYear();
   const mm = pad(date.getMonth() + 1);
   const dd = pad(date.getDate());
   const hh = pad(date.getHours());
   const min = pad(date.getMinutes());

   return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const computeNextOrder = (ads: Ad[]) => {
   if (!ads.length) return 1;
   const maxOrder = Math.max(...ads.map((ad) => ad.display_order ?? 0));
   return maxOrder + 1;
};

const defaultFormValues = (order: number): AdFormData => ({
   title: '',
   tagline: '',
   cta_label: '',
   cta_url: '',
   image: '',
   image_file: null,
   display_order: order,
   is_active: true,
   starts_at: '',
   ends_at: '',
});

const AdsIndex = () => {
   const { props } = usePage<AdsPageProps>();
   const { ads } = props;
   const { dashboard, button, common } = props.translate;

   const [editingAd, setEditingAd] = useState<Ad | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const isEditing = Boolean(editingAd);
   const activeAds = ads.filter((ad) => ad.is_active).length;
   const scheduledAds = ads.filter((ad) => !!ad.starts_at || !!ad.ends_at).length;

   const nextOrder = useMemo(() => computeNextOrder(ads), [ads]);

   const form = useForm<AdFormData>(defaultFormValues(nextOrder));
   const { data, setData, post, processing, errors, clearErrors } = form;

   const startCreate = () => {
      const initial = defaultFormValues(computeNextOrder(ads));
      setEditingAd(null);
      setData(() => initial);
      clearErrors();
      setImagePreview(null);
   };

   const startEdit = (ad: Ad) => {
      const payload: AdFormData = {
         title: ad.title ?? '',
         tagline: ad.tagline ?? '',
         cta_label: ad.cta_label ?? '',
         cta_url: ad.cta_url ?? '',
         image: ad.image ?? '',
         image_file: null,
         display_order: ad.display_order ?? 0,
         is_active: Boolean(ad.is_active),
         starts_at: formatForInput(ad.starts_at),
         ends_at: formatForInput(ad.ends_at),
      };

      setEditingAd(ad);
      setData(() => payload);
      clearErrors();
      setImagePreview(ad.image || null);
   };

   const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const routeName = editingAd ? route('ads.update', editingAd.id) : route('ads.store');

      form.transform((formData) => ({
         ...formData,
         _method: editingAd ? 'put' : 'post',
      }));

      post(routeName, {
         forceFormData: true,
         preserveScroll: true,
         onSuccess: () => {
            startCreate();
         },
         onFinish: () => {
            form.transform((formData) => formData);
         },
      });
   };

   const handleDelete = (ad: Ad) => {
      if (!confirm(`${dashboard.are_you_absolutely_sure ?? 'Are you absolutely sure?'}\n${ad.title}`)) {
         return;
      }

      router.delete(route('ads.destroy', ad.id), {
         preserveScroll: true,
      });
   };

   return (
      <>
         <Head title={dashboard.ad_management} />

         <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                     <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Ads</p>
                     <h1 className="text-3xl font-semibold">{dashboard.ad_management}</h1>
                     <p className="text-muted-foreground text-sm max-w-3xl">{dashboard.ad_management_description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button onClick={startCreate} variant={isEditing ? 'outline' : 'default'} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {dashboard.create_ad}
                     </Button>
                  </div>
               </div>

               <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-background/80 p-4">
                     <p className="text-xs uppercase tracking-wide text-muted-foreground">{dashboard.hero_ads}</p>
                     <p className="text-3xl font-semibold">{ads.length}</p>
                     <span className="text-muted-foreground text-sm">Total ads configured</span>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4">
                     <p className="text-xs uppercase tracking-wide text-muted-foreground">{button.active}</p>
                     <p className="text-3xl font-semibold">{activeAds}</p>
                     <span className="text-muted-foreground text-sm">{dashboard.active ?? 'Currently visible'}</span>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4">
                     <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled</p>
                     <p className="text-3xl font-semibold">{scheduledAds}</p>
                     <span className="text-muted-foreground text-sm">{dashboard.starts_at}</span>
                  </div>
               </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
               <Card className="h-max">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-6 py-4">
                     <CardTitle className="text-base font-semibold">{dashboard.hero_ads}</CardTitle>
                     <Badge variant="outline">{ads.length}</Badge>
                  </CardHeader>

                  <CardContent className="p-0">
                     {ads.length ? (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>{common.title}</TableHead>
                                 <TableHead className="w-[160px]">{common.status}</TableHead>
                                 <TableHead className="w-[220px]">{dashboard.starts_at}</TableHead>
                                 <TableHead className="w-[100px] text-center">{dashboard.display_order}</TableHead>
                                 <TableHead className="w-[140px] text-right">{common.actions}</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {ads.map((ad) => (
                                 <TableRow key={ad.id}>
                                    <TableCell>
                                       <div className="flex items-center gap-4">
                                          <div className="hidden h-16 w-24 overflow-hidden rounded-md border sm:block">
                                             <img
                                                src={ad.image || '/assets/images/blank-image.jpg'}
                                                alt={ad.title}
                                                className="h-full w-full object-cover"
                                             />
                                          </div>
                                          <div className="space-y-1">
                                             <p className="font-semibold">{ad.title}</p>
                                             {ad.tagline && <p className="text-muted-foreground text-sm">{ad.tagline}</p>}
                                             {ad.cta_label && (
                                                <p className="text-xs text-muted-foreground">
                                                   {dashboard.cta_label}: <span className="font-medium">{ad.cta_label}</span>
                                                </p>
                                             )}
                                             {ad.cta_url && (
                                                <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline">
                                                   {ad.cta_url}
                                                </a>
                                             )}
                                          </div>
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex flex-col gap-1">
                                          <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                                             {ad.is_active ? button.active : button.inactive}
                                          </Badge>
                                          {ad.ends_at && (
                                             <span className="text-muted-foreground text-xs">
                                                {dashboard.ends_at}: {formatDateTime(ad.ends_at)}
                                             </span>
                                          )}
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <div className="text-sm">
                                          <p>
                                             <span className="text-muted-foreground">{dashboard.starts_at}:</span> {formatDateTime(ad.starts_at)}
                                          </p>
                                          <p>
                                             <span className="text-muted-foreground">{dashboard.ends_at}:</span> {formatDateTime(ad.ends_at)}
                                          </p>
                                       </div>
                                    </TableCell>

                                    <TableCell className="text-center font-semibold">{ad.display_order}</TableCell>

                                    <TableCell>
                                       <div className="flex items-center justify-end gap-2">
                                          <Button size="icon" variant="outline" onClick={() => startEdit(ad)}>
                                             <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button size="icon" variant="destructive" onClick={() => handleDelete(ad)}>
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     ) : (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                           <div className="text-muted-foreground text-sm">
                              {dashboard.hero_ads} — {dashboard.no_results ?? 'No ads yet. Add your first hero ad.'}
                           </div>
                           <Button onClick={startCreate} variant="outline" className="gap-2">
                              <Plus className="h-4 w-4" />
                              {dashboard.create_ad}
                           </Button>
                        </div>
                     )}
                  </CardContent>
               </Card>

               <Card className="border-primary/20 bg-card/70 shadow-lg">
                  <CardHeader className="space-y-1 border-b px-6 py-4">
                     <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {isEditing ? dashboard.edit_ad : dashboard.create_ad}
                     </p>
                     <CardTitle className="text-xl">{isEditing ? editingAd?.title : dashboard.hero_ads}</CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                     <form onSubmit={submitForm} className="space-y-6">
                        <div className="space-y-6 rounded-2xl border bg-card/50 p-4 shadow-sm">
                           <div className="grid gap-4">
                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{common.title}</Label>
                                 <Input name="title" value={data.title} onChange={(e) => onHandleChange(e, setData)} required />
                                 <InputError message={errors.title} />
                              </div>

                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.tagline}</Label>
                                 <Input
                                    name="tagline"
                                    value={data.tagline}
                                    onChange={(e) => onHandleChange(e, setData)}
                                    placeholder="Inspire parents and learners..."
                                 />
                                 <InputError message={errors.tagline} />
                              </div>

                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.cta_label}</Label>
                                 <Input name="cta_label" value={data.cta_label} onChange={(e) => onHandleChange(e, setData)} placeholder={dashboard.cta_label} />
                                 <InputError message={errors.cta_label} />
                              </div>

                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.cta_url}</Label>
                                 <Input
                                    name="cta_url"
                                    type="url"
                                    value={data.cta_url}
                                    onChange={(e) => onHandleChange(e, setData)}
                                    placeholder="https://example.com/courses"
                                 />
                                 <InputError message={errors.cta_url} />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border bg-card/50 p-4 shadow-sm">
                           <div className="grid gap-4">
                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.display_order}</Label>
                                 <Input
                                    name="display_order"
                                    type="number"
                                    min={0}
                                    value={data.display_order}
                                    onChange={(e) => setData('display_order', Number(e.target.value))}
                                 />
                                 <InputError message={errors.display_order} />
                                 <p className="text-muted-foreground text-xs">Lower numbers show first.</p>
                              </div>

                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.starts_at}</Label>
                                 <Input name="starts_at" type="datetime-local" value={data.starts_at} onChange={(e) => onHandleChange(e, setData)} />
                                 <InputError message={errors.starts_at} />
                              </div>

                              <div className="space-y-2 rounded-xl border bg-background/80 p-3">
                                 <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dashboard.ends_at}</Label>
                                 <Input name="ends_at" type="datetime-local" value={data.ends_at} onChange={(e) => onHandleChange(e, setData)} />
                                 <InputError message={errors.ends_at} />
                              </div>

                              <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
                                 <div>
                                    <p className="text-sm font-semibold">{button.active}</p>
                                    <p className="text-muted-foreground text-xs">
                                       {dashboard.hero_ads} {dashboard.active ?? 'Active ads rotate through the hero slider.'}
                                    </p>
                                 </div>
                                 <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border bg-card/30 p-4 shadow-sm">
                           <div className="space-y-3">
                              <Label className="text-sm font-medium">{dashboard.image_url}</Label>
                              <Input
                                 name="image"
                                 value={data.image}
                                 onChange={(e) => {
                                    onHandleChange(e, setData);
                                    setImagePreview(e.target.value || null);
                                 }}
                                 placeholder="https://cdn.domain.com/hero.png"
                              />
                              <InputError message={errors.image} />

                              <div className="space-y-2">
                                 <Label className="text-sm font-medium">Upload image</Label>
                                 <Input type="file" name="image_file" accept="image/*" onChange={(e) => onHandleChange(e, setData, setImagePreview)} />
                                 <InputError message={errors.image_file} />
                                 <p className="text-muted-foreground text-xs">Recommended size 1600×900px, JPG/PNG.</p>
                              </div>
                           </div>

                           <div className="rounded-xl border bg-muted">
                              <img
                                 src={imagePreview || data.image || '/assets/images/blank-image.jpg'}
                                 alt="Ad preview"
                                 className={cn('h-48 w-full object-cover', !imagePreview && !data.image ? 'opacity-40' : '')}
                              />
                           </div>
                        </div>

                        <div className="flex flex-col gap-3">
                           <LoadingButton loading={processing} className="w-full gap-2">
                              {isEditing ? button.update : button.create}
                           </LoadingButton>
                           <Button type="button" variant="ghost" onClick={startCreate}>
                              {isEditing ? button.cancel : 'Reset form'}
                           </Button>
                        </div>
                     </form>
                  </CardContent>
               </Card>
            </div>
         </div>
      </>
   );
};

AdsIndex.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default AdsIndex;

