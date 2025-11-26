import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LandingLayout from '@/layouts/landing-layout';
import { SharedData } from '@/types/global';
import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import { router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface Props extends SharedData {
   salesPoints: SalesPoint[];
   mapMarkers: SalesPointMapMarker[];
   regions: string[];
   cities: string[];
   googleMapsApiKey: string;
   filters: {
      search?: string;
      region?: string;
      city?: string;
   };
}

const mapContainerStyle = {
   width: '100%',
   height: '600px',
};

const defaultCenter = {
   lat: 33.3152,
   lng: 44.3661, // Baghdad, Iraq
};

const Index = ({ salesPoints, mapMarkers, regions, cities, googleMapsApiKey, filters, translate }: Props) => {
   const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
   const [search, setSearch] = useState(filters.search || '');
   const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
   const [selectedCity, setSelectedCity] = useState(filters.city || '');
   const [selectedMarker, setSelectedMarker] = useState<SalesPointMapMarker | null>(null);

   const handleFilter = () => {
      router.get(
         route('public.sales-points.index'),
         {
            search,
            region: selectedRegion,
            city: selectedCity,
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
      router.get(route('public.sales-points.index'));
   };

   const getDirections = (lat: number, lng: number) => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
   };

   return (
      <div>
         <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
               <h1 className="text-3xl font-bold mb-2">Find Our Sales Points</h1>
               <p className="text-muted-foreground">
                  Locate authorized dealers and bookstores where you can purchase our prepaid course cards
               </p>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                     <Label>Search</Label>
                     <Input
                        type="text"
                        placeholder="Search by name or address..."
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

            {/* View Toggle */}
            <div className="flex justify-between items-center mb-4">
               <div className="text-sm text-muted-foreground">
                  Found {salesPoints.length} sales point{salesPoints.length !== 1 ? 's' : ''}
               </div>
               <div className="flex gap-2">
                  <Button
                     variant={viewMode === 'map' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setViewMode('map')}
                  >
                     Map View
                  </Button>
                  <Button
                     variant={viewMode === 'list' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setViewMode('list')}
                  >
                     List View
                  </Button>
               </div>
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
               <Card className="p-4 mb-6">
                  <LoadScript googleMapsApiKey={googleMapsApiKey}>
                     <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={
                           mapMarkers.length > 0
                              ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng }
                              : defaultCenter
                        }
                        zoom={mapMarkers.length > 0 ? 12 : 10}
                     >
                        {mapMarkers.map((marker) => (
                           <Marker
                              key={marker.id}
                              position={{ lat: marker.lat, lng: marker.lng }}
                              onClick={() => setSelectedMarker(marker)}
                           />
                        ))}

                        {selectedMarker && (
                           <InfoWindow
                              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                              onCloseClick={() => setSelectedMarker(null)}
                           >
                              <div className="p-2 max-w-xs">
                                 <h3 className="font-semibold text-lg mb-2">{selectedMarker.name}</h3>
                                 <p className="text-sm text-gray-600 mb-2">{selectedMarker.address}</p>
                                 <div className="space-y-2">
                                    <a
                                       href={`tel:${selectedMarker.phone}`}
                                       className="block text-blue-600 hover:underline text-sm"
                                    >
                                       📞 {selectedMarker.phone}
                                    </a>
                                    <Button
                                       size="sm"
                                       onClick={() => getDirections(selectedMarker.lat, selectedMarker.lng)}
                                       className="w-full"
                                    >
                                       Get Directions
                                    </Button>
                                 </div>
                              </div>
                           </InfoWindow>
                        )}
                     </GoogleMap>
                  </LoadScript>
               </Card>
            )}

            {/* List View */}
            {viewMode === 'list' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesPoints.length === 0 ? (
                     <div className="col-span-full">
                        <Card className="p-8">
                           <div className="text-center text-muted-foreground">
                              <p className="text-lg mb-2">No sales points found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                           </div>
                        </Card>
                     </div>
                  ) : (
                     salesPoints.map((point) => (
                        <Card key={point.id} className="p-6 hover:shadow-lg transition-shadow">
                           {point.image && (
                              <img
                                 src={point.image}
                                 alt={point.name}
                                 className="w-full h-40 object-cover rounded-lg mb-4"
                              />
                           )}
                           <h3 className="text-lg font-semibold mb-2">{point.name}</h3>
                           <div className="space-y-2 text-sm mb-4">
                              <p className="text-muted-foreground">
                                 📍 {point.address}
                                 {point.city && `, ${point.city}`}
                                 {point.region && `, ${point.region}`}
                              </p>
                              <a href={`tel:${point.phone}`} className="block text-blue-600 hover:underline">
                                 📞 {point.phone}
                              </a>
                              {point.email && (
                                 <a href={`mailto:${point.email}`} className="block text-blue-600 hover:underline">
                                    ✉️ {point.email}
                                 </a>
                              )}
                              {point.website && (
                                 <a
                                    href={point.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 hover:underline"
                                 >
                                    🌐 Visit Website
                                 </a>
                              )}
                           </div>
                           {point.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{point.description}</p>
                           )}
                           <div className="flex gap-2">
                              {point.latitude && point.longitude && (
                                 <>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => {
                                          setViewMode('map');
                                          const marker = mapMarkers.find((m) => m.id === point.id);
                                          if (marker) setSelectedMarker(marker);
                                       }}
                                       className="flex-1"
                                    >
                                       View on Map
                                    </Button>
                                    <Button
                                       size="sm"
                                       onClick={() => getDirections(point.latitude!, point.longitude!)}
                                       className="flex-1"
                                    >
                                       Get Directions
                                    </Button>
                                 </>
                              )}
                           </div>
                        </Card>
                     ))
                  )}
               </div>
            )}

            {/* Info Card */}
            <Card className="p-6 mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
               <h3 className="font-semibold mb-2">How to Purchase</h3>
               <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                     <span className="font-semibold">1.</span>
                     <span>Visit any of our authorized sales points listed above</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="font-semibold">2.</span>
                     <span>Choose the course or bundle you want to purchase</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="font-semibold">3.</span>
                     <span>Receive your prepaid card with a unique redemption code</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="font-semibold">4.</span>
                     <span>Redeem your card online and start learning immediately!</span>
                  </li>
               </ol>
            </Card>
         </div>
      </div>
   );
};

Index.layout = (page: ReactNode) => <LandingLayout language={true}>{page}</LandingLayout>;

export default Index;
