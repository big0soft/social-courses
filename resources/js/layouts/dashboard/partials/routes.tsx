import { routeLastSegment } from '@/lib/route';
import { Book, Briefcase, CassetteTape, CreditCard, DollarSign, LayoutDashboard, ListChecks, MapPin, Megaphone, Newspaper, Receipt, School, Settings, Users } from 'lucide-react';
import { LanguageTranslations } from '@/types/lang';

// Helper to safely get route or return fallback
const safeRoute = (name: string, fallback = '#') => {
   try {
      return route(name);
   } catch (e) {
      console.error(`Route '${name}' not found`, e);
      return fallback;
   }
};

const getDashboardRoutes = (translate: LanguageTranslations): DashboardRoute[] => {
   const { button } = translate;
   
   return [
   {
      title: button.main_menu,
      slug: 'main-menu',
      pages: [
         {
            Icon: LayoutDashboard,
            name: button.dashboard,
            path: route('dashboard'),
            slug: routeLastSegment(route('dashboard')),
            active: true,
            access: ['admin', 'instructor', 'student', 'collaborative', 'administrative'],
            children: [],
         },
         {
            Icon: CreditCard,
            name: button.redeem_card,
            path: safeRoute('card.redeem', '/card/redeem'),
            slug: 'card-redeem',
            active: true,
            access: ['student', 'instructor', 'admin', 'collaborative', 'administrative', 'default'],
            children: [],
         },
         {
            Icon: ListChecks,
            name: button.categories,
            path: route('categories.index'),
            slug: routeLastSegment(route('categories.index')),
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [],
         },
         {
            Icon: School,
            name: button.courses,
            path: '',
            slug: 'courses',
            active: true,
            access: ['admin', 'instructor', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.manage_courses,
                  slug: routeLastSegment(route('courses.index')),
                  path: route('courses.index'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
               {
                  name: button.create_course,
                  slug: routeLastSegment(route('courses.create')),
                  path: route('courses.create'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: CassetteTape,
            name: button.enrollments,
            path: '',
            slug: 'enrollments',
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.manage_enrollments,
                  slug: routeLastSegment(route('enrollments.index')),
                  path: route('enrollments.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.add_new_enrollment,
                  slug: routeLastSegment(route('enrollments.create')),
                  path: route('enrollments.create'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: CassetteTape,
            name: button.enrollments,
            path: route('enrollments.index'),
            slug: routeLastSegment(route('enrollments.index')),
            active: true,
            access: ['instructor', 'collaborative'],
            children: [],
         },
         {
            Icon: CreditCard,
            name: button.prepaid_cards,
            path: '',
            slug: 'prepaid-cards',
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.manage_cards,
                  slug: routeLastSegment(route('prepaid-cards.index')),
                  path: route('prepaid-cards.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.generate_cards,
                  slug: routeLastSegment(route('prepaid-cards.create')),
                  path: route('prepaid-cards.create'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.statistics,
                  slug: routeLastSegment(route('prepaid-cards.statistics')),
                  path: route('prepaid-cards.statistics'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: MapPin,
            name: button.sales_points,
            path: '',
            slug: 'sales-points',
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.manage_sales_points,
                  slug: routeLastSegment(route('sales-points.index')),
                  path: route('sales-points.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.add_sales_point,
                  slug: routeLastSegment(route('sales-points.create')),
                  path: route('sales-points.create'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: DollarSign,
            name: button.sales_point_purchases,
            path: '',
            slug: 'sales-point-purchases',
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.purchase_history,
                  slug: routeLastSegment(route('sales-point-purchases.index')),
                  path: route('sales-point-purchases.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.sell_cards,
                  slug: routeLastSegment(route('sales-point-purchases.create')),
                  path: route('sales-point-purchases.create'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.revenue_analytics,
                  slug: routeLastSegment(route('sales-point-purchases.analytics')),
                  path: route('sales-point-purchases.analytics'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: Users,
            name: button.instructors,
            path: '',
            slug: 'instructors',
            active: true,
            access: ['admin', 'collaborative'],
            children: [
               {
                  name: button.manage_instructors,
                  slug: routeLastSegment(route('instructors.index')),
                  path: route('instructors.index'),
                  access: ['admin', 'collaborative'],
               },
               {
                  name: button.create_instructor,
                  slug: routeLastSegment(route('instructors.create')),
                  path: route('instructors.create'),
                  access: ['admin', 'collaborative'],
               },
               {
                  name: button.applications,
                  slug: routeLastSegment(route('instructors.applications')),
                  path: route('instructors.applications', {
                     status: 'pending',
                  }),
                  access: ['admin', 'collaborative'],
               },
            ],
         },
         {
            Icon: Receipt,
            name: button.payout_report,
            path: '',
            slug: 'payouts',
            active: true,
            access: ['admin', 'collaborative'],
            children: [
               {
                  name: button.payout_request,
                  slug: routeLastSegment(route('payouts.request.index')),
                  path: route('payouts.request.index'),
                  access: ['admin', 'collaborative'],
               },
               {
                  name: button.payout_history,
                  slug: routeLastSegment(route('payouts.history.index')),
                  path: route('payouts.history.index'),
                  access: ['admin', 'collaborative'],
               },
            ],
         },
         {
            Icon: Receipt,
            name: button.payouts,
            path: '',
            slug: 'payouts',
            active: true,
            access: ['instructor', 'collaborative'],
            children: [
               {
                  name: button.withdraw,
                  slug: routeLastSegment(route('payouts.index')),
                  path: route('payouts.index'),
                  access: ['instructor', 'collaborative'],
               },
               {
                  name: button.settings,
                  slug: routeLastSegment(route('payouts.settings.index')),
                  path: route('payouts.settings.index'),
                  access: ['instructor', 'collaborative'],
               },
            ],
         },
         {
            Icon: Briefcase,
            name: button.job_circulars,
            path: '',
            slug: 'job-circulars',
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.all_jobs,
                  slug: routeLastSegment(route('job-circulars.index')),
                  path: route('job-circulars.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.create_job,
                  slug: routeLastSegment(route('job-circulars.create')),
                  path: route('job-circulars.create'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: Book,
            name: button.blogs,
            path: '',
            slug: 'blogs',
            active: true,
            access: ['admin', 'instructor', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.categories,
                  slug: routeLastSegment(route('blogs.categories.index')),
                  path: route('blogs.categories.index'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
               {
                  name: button.create_blog,
                  slug: routeLastSegment(route('blogs.create')),
                  path: route('blogs.create'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
               {
                  name: button.manage_blog,
                  slug: routeLastSegment(route('blogs.index')),
                  path: route('blogs.index'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
            ],
         },
         {
            Icon: Newspaper,
            name: button.newsletters,
            path: route('newsletters.index'),
            slug: routeLastSegment(route('newsletters.index')),
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [],
         },
        {
            Icon: Megaphone,
            name: translate.dashboard.ads,
            path: route('ads.index'),
            slug: routeLastSegment(route('ads.index')),
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [],
        },
         {
            Icon: Users,
            name: button.all_users,
            path: route('users.index'),
            slug: routeLastSegment(route('users.index')),
            active: true,
            access: ['admin', 'collaborative', 'administrative'],
            children: [],
         },
         {
            Icon: Settings,
            name: button.settings,
            path: '',
            slug: 'settings',
            active: true,
            access: ['admin', 'instructor', 'collaborative', 'administrative'],
            children: [
               {
                  name: button.account,
                  slug: routeLastSegment(route('settings.account')),
                  path: route('settings.account'),
                  access: ['admin', 'instructor', 'collaborative', 'administrative'],
               },
               {
                  name: button.system,
                  slug: routeLastSegment(route('settings.system')),
                  path: route('settings.system'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.pages,
                  slug: routeLastSegment(route('settings.pages')),
                  path: route('settings.pages'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.storage,
                  slug: routeLastSegment(route('settings.storage')),
                  path: route('settings.storage'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.payment,
                  slug: routeLastSegment(route('settings.payment')),
                  path: route('settings.payment'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.smtp,
                  slug: routeLastSegment(route('settings.smtp')),
                  path: route('settings.smtp'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.auth0,
                  slug: routeLastSegment(route('settings.auth0')),
                  path: route('settings.auth0'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.live_class,
                  slug: routeLastSegment(route('settings.live-class')),
                  path: route('settings.live-class'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
               {
                  name: button.translation,
                  slug: routeLastSegment(route('language.index')),
                  path: route('language.index'),
                  access: ['admin', 'collaborative', 'administrative'],
               },
            ],
         },
      ],
   },
   ];
};

export default getDashboardRoutes;
