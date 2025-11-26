interface PrepaidCard extends TableCommon {
   code: string;
   card_type: 'single_course' | 'bundle';
   title: string | null;
   description: string | null;
   price: number;
   currency: string;
   course_id: number | null;
   status: 'active' | 'used' | 'expired' | 'disabled';
   used_by: number | null;
   used_at: string | null;
   expires_at: string | null;
   created_by: number;
   batch_id: string | null;
   notes: string | null;

   // Relationships
   course?: {
      id: number;
      title: string;
      slug: string;
   };
   bundleCourses?: Array<{
      id: number;
      title: string;
      slug: string;
   }>;
   usedByUser?: {
      id: number;
      name: string;
      email: string;
   };
   creator?: {
      id: number;
      name: string;
   };
   activation?: CardActivation;
}

interface CardActivation extends TableCommon {
   prepaid_card_id: number;
   user_id: number;
   ip_address: string | null;
   user_agent: string | null;
   activated_at: string;
   courses_enrolled: number[];

   // Relationships
   prepaidCard?: PrepaidCard;
   user?: {
      id: number;
      name: string;
      email: string;
   };
}

interface CardStatistics {
   total_cards: number;
   active_cards: number;
   used_cards: number;
   expired_cards: number;
   total_value: number;
   redeemed_value: number;
   recent_activations: number;
   total_activations: number;
   by_type: {
      single_course: number;
      bundle: number;
   };
}

interface CardBatch {
   batch_id: string;
   count: number;
   created_at: string;
}
