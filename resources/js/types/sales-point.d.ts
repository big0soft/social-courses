interface SalesPoint extends TableCommon {
   name: string;
   address: string;
   region: string | null;
   city: string | null;
   country: string;
   latitude: number | null;
   longitude: number | null;
   phone: string;
   email: string | null;
   website: string | null;
   description: string | null;
   image: string | null;
   status: 'approved' | 'disabled';
   created_by: number;
   notes: string | null;

   // Relationships
   creator?: {
      id: number;
      name: string;
   };
}

interface SalesPointMapMarker {
   id: number;
   name: string;
   address: string;
   phone: string;
   lat: number;
   lng: number;
}

interface SalesPointStats {
   total: number;
   approved: number;
   disabled: number;
}
