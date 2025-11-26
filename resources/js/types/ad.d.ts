interface Ad extends TableCommon {
   title: string;
   tagline: string | null;
   image: string;
   cta_label: string | null;
   cta_url: string | null;
   display_order: number;
   is_active: boolean;
   starts_at: string | null;
   ends_at: string | null;
}

