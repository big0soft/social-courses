# Frontend Integration Guide - Beta E-Learning

This document provides guidance for building the React frontend pages to integrate with the Beta E-Learning backend.

## 🚀 Backend APIs Ready to Use

All backend endpoints are fully implemented and ready for frontend integration:

### 1. Prepaid Card System

#### Admin Routes (Prefix: `/dashboard/prepaid-cards`)
- `GET /` - List all cards (with search, filters, pagination)
- `GET /create` - Show card generation form
- `POST /` - Generate cards (single or bulk)
- `GET /{id}` - View card details
- `PUT /{id}` - Update card (status, notes, expiry)
- `DELETE /{id}` - Delete card
- `GET /export/csv` - Export cards to CSV
- `GET /statistics/overview` - Get card statistics
- `GET /batches/list` - Get list of card batches

#### Student Routes (Prefix: `/card`)
- `GET /redeem` - Show redemption form
- `POST /redeem/validate` - Validate card code (AJAX)
- `POST /redeem/activate` - Redeem card
- `GET /history` - Show activation history

### 2. Sales Points System

#### Admin Routes (Prefix: `/dashboard/sales-points`)
- `GET /` - List all sales points
- `GET /create` - Create sales point form
- `POST /` - Store new sales point
- `GET /{id}` - View sales point
- `GET /{id}/edit` - Edit sales point form
- `PUT /{id}` - Update sales point
- `DELETE /{id}` - Delete sales point

#### Public Routes
- `GET /sales-points` - Public listing with map
- `GET /sales-points/{id}` - View sales point details
- `GET /api/sales-points` - JSON API for map integration

### 3. Payment Gateway (Zain Cash)
- `POST /payments/zaincash/payment` - Initialize payment
- `GET /payments/zaincash/callback` - Handle callback
- `GET /payments/zaincash/cancel` - Handle cancellation

---

## 📦 Frontend Pages to Build

### Priority 1: Admin Card Management

#### 1. Card Generation Page
**Path:** `resources/js/pages/dashboard/prepaid-cards/create.tsx`

**Props from Backend:**
```typescript
interface CreateProps {
  courses: Array<{id: number, title: string, price: number}>;
  cardTypes: Array<{value: string, label: string}>;
}
```

**Form Fields:**
- Card Type (select: single_course | bundle)
- Course ID (if single_course) - searchable select
- Course IDs (if bundle) - multi-select
- Title (for bundle)
- Description (for bundle)
- Price (number)
- Currency (default: USD)
- Quantity (number, 1-1000)
- Expires At (date, optional)
- Notes (textarea, optional)

**Submit to:** `POST /dashboard/prepaid-cards`

---

#### 2. Card Management Dashboard
**Path:** `resources/js/pages/dashboard/prepaid-cards/index.tsx`

**Props from Backend:**
```typescript
interface IndexProps {
  cards: PaginatedResponse<{
    id: number;
    code: string;
    card_type: 'single_course' | 'bundle';
    title: string | null;
    price: number;
    currency: string;
    status: 'active' | 'used' | 'expired' | 'disabled';
    course: {id: number, title: string} | null;
    bundleCourses: Array<{id: number, title: string}>;
    usedByUser: {id: number, name: string} | null;
    used_at: string | null;
    expires_at: string | null;
    created_at: string;
  }>;
  stats: {
    total: number;
    active: number;
    used: number;
    expired: number;
    total_value: number;
  };
}
```

**Features:**
- Data table with search, filters (status, type, batch)
- Export to CSV button
- Quick actions: view, edit, delete
- Status badges with colors
- Statistics cards at top

---

#### 3. Card Statistics Page
**Path:** `resources/js/pages/dashboard/prepaid-cards/statistics.tsx`

**Features:**
- Total cards generated
- Active vs Used breakdown (charts)
- Revenue from cards
- Recent activations (last 7 days)
- Cards by type (pie chart)

---

### Priority 2: Student Card Redemption

#### 4. Card Redemption Page
**Path:** `resources/js/pages/student/card-redemption/index.tsx`

**Props from Backend:**
```typescript
interface RedemptionProps {
  activations: Array<{
    id: number;
    prepaid_card: {
      code: string;
      card_type: string;
      course: {title: string} | null;
      bundleCourses: Array<{title: string}>;
    };
    activated_at: string;
    courses_enrolled: number[];
  }>;
}
```

**Features:**
- Card code input field (format: BETA-XXXX-XXXX-XXXX)
- Validate button (AJAX call to `/card/redeem/validate`)
- Shows card details after validation
- Redeem button (submits to `/card/redeem/activate`)
- List of previously redeemed cards below

**Validation Flow:**
1. User enters code
2. Click "Validate"
3. AJAX call to `/card/redeem/validate`
4. Show card details: type, courses, already enrolled courses
5. Click "Redeem" if valid
6. POST to `/card/redeem/activate`
7. Success message + redirect to courses

---

### Priority 3: Sales Points

#### 5. Admin Sales Points Management
**Path:** `resources/js/pages/dashboard/sales-points/index.tsx`

**Props from Backend:**
```typescript
interface SalesPointsProps {
  salesPoints: PaginatedResponse<{
    id: number;
    name: string;
    address: string;
    region: string;
    city: string;
    phone: string;
    email: string | null;
    website: string | null;
    latitude: number | null;
    longitude: number | null;
    status: 'approved' | 'disabled';
  }>;
  stats: {
    total: number;
    approved: number;
    disabled: number;
  };
  regions: string[];
  cities: string[];
}
```

**Features:**
- Data table with search, filters (region, city, status)
- CRUD buttons: Create, Edit, Delete
- Map preview for each location (if coordinates exist)

---

#### 6. Public Sales Points Listing
**Path:** `resources/js/pages/sales-points/index.tsx`

**Props from Backend:**
```typescript
interface PublicSalesPointsProps {
  salesPoints: Array<{
    id: number;
    name: string;
    address: string;
    region: string;
    city: string;
    phone: string;
    email: string | null;
    website: string | null;
    description: string | null;
  }>;
  mapMarkers: Array<{
    id: number;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
  }>;
  regions: string[];
  cities: string[];
  googleMapsApiKey: string;
}
```

**Features:**
- Google Maps integration with markers
- Search by name/address
- Filter by region/city
- List view + Map view toggle
- Click marker to see details popup
- Click-to-call phone numbers
- Get directions button

**Google Maps Integration:**
```tsx
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

<LoadScript googleMapsApiKey={googleMapsApiKey}>
  <GoogleMap
    mapContainerStyle={{ width: '100%', height: '500px' }}
    center={{ lat: 33.3152, lng: 44.3661 }} // Baghdad
    zoom={10}
  >
    {mapMarkers.map(marker => (
      <Marker
        key={marker.id}
        position={{ lat: marker.lat, lng: marker.lng }}
        onClick={() => handleMarkerClick(marker)}
      />
    ))}
  </GoogleMap>
</LoadScript>
```

---

## 🔧 Backend Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

### Pagination Response
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 10,
  "per_page": 20,
  "total": 200,
  "from": 1,
  "to": 20
}
```

---

## 🎨 UI Components Suggestions

### Card Code Input Component
```tsx
interface CardCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: () => void;
  isLoading: boolean;
}

// Auto-format input as user types: BETA-XXXX-XXXX-XXXX
```

### Status Badge Component
```tsx
interface StatusBadgeProps {
  status: 'active' | 'used' | 'expired' | 'disabled';
}

// Colors:
// - active: green
// - used: gray
// - expired: red
// - disabled: orange
```

### Google Maps Marker Info Window
```tsx
<InfoWindow>
  <div>
    <h3>{salesPoint.name}</h3>
    <p>{salesPoint.address}</p>
    <p>{salesPoint.phone}</p>
    <a href={`tel:${salesPoint.phone}`}>Call Now</a>
    <a href={`https://maps.google.com/?q=${lat},${lng}`}>Get Directions</a>
  </div>
</InfoWindow>
```

---

## 🔐 Authentication

All admin routes require authentication middleware. Student routes require `auth` middleware.

Check authentication in Inertia:
```tsx
import { usePage } from '@inertiajs/react';

const { auth } = usePage().props;
// auth.user contains authenticated user data
```

---

## 📊 Data Tables

Use existing table components from the project. Example structure:
```tsx
<DataTable
  data={cards.data}
  columns={[
    { key: 'code', label: 'Card Code' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'price', label: 'Price', render: (row) => `${row.price} ${row.currency}` },
    { key: 'actions', label: 'Actions', render: (row) => <ActionButtons row={row} /> }
  ]}
  pagination={cards}
  onPageChange={handlePageChange}
  searchable
  filterable
/>
```

---

## 🧪 Testing Endpoints

Use tools like Postman or Thunder Client to test endpoints before building UI:

1. **Generate a test card:**
   - POST `/dashboard/prepaid-cards`
   - Body: `{ card_type: "single_course", course_id: 1, price: 50, quantity: 1 }`

2. **Validate the card:**
   - POST `/card/redeem/validate`
   - Body: `{ code: "BETA-XXXX-XXXX-XXXX" }`

3. **Redeem the card:**
   - POST `/card/redeem/activate`
   - Body: `{ code: "BETA-XXXX-XXXX-XXXX" }`

---

## 📱 WhatsApp Widget

Already created: `resources/js/components/WhatsAppWidget.tsx`

**Usage:**
```tsx
import WhatsAppWidget from '@/components/WhatsAppWidget';

// Add to layout
<WhatsAppWidget
  phoneNumber={import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE || '+964XXXXXXXXXX'}
  message="Hello! I need help with Beta E-Learning."
  position="bottom-right"
/>
```

---

## ⚙️ Environment Variables

Required in `.env`:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_key
WHATSAPP_BUSINESS_PHONE=+964XXXXXXXXXX
```

Access in React:
```tsx
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## 📚 Additional Resources

- **Inertia.js Docs:** https://inertiajs.com/
- **React Google Maps API:** https://react-google-maps-api-docs.netlify.app/
- **Tailwind CSS:** Already configured in the project

---

## ✅ Checklist for Frontend Developers

- [ ] Install dependencies: `npm install @react-google-maps/api`
- [ ] Create admin card generation page
- [ ] Create admin card management dashboard
- [ ] Create student card redemption page
- [ ] Create admin sales points management
- [ ] Create public sales points listing with Google Maps
- [ ] Integrate WhatsApp widget in main layout
- [ ] Add Google Maps API key to `.env`
- [ ] Test all flows end-to-end
- [ ] Add loading states and error handling
- [ ] Implement responsive design for mobile

---

**Backend Ready:** ✅ All APIs functional and tested
**Your Turn:** Build beautiful, user-friendly interfaces! 🎨
