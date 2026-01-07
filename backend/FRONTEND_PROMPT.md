# Complete Frontend Development Prompt
## Secure Event Management & Ticketing System - Full Stack Frontend

---

## PROJECT OVERVIEW

Build a modern, responsive, and accessible React frontend for a secure event management and ticketing system with comprehensive security features, real-time updates, and excellent user experience. The frontend must support **4 distinct portals** based on user roles: **Admin**, **Organizer**, **Staff**, and **User**.

---

## TECHNOLOGY STACK

- **React 19+** with Vite
- **React Router DOM 7+** for routing
- **React Query (@tanstack/react-query)** for data fetching and caching
- **Axios** for HTTP requests
- **Formik + Yup** for form handling and validation
- **Tailwind CSS** for styling
- **qrcode.react** for QR code display
- **Socket.io-client** (optional) for real-time updates
- **React Icons / Heroicons** for icons
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Recharts** or **Chart.js** for analytics charts
- **date-fns** for date formatting
- **react-qr-scanner** for QR code scanning (staff portal)

---

## PROJECT STRUCTURE

```
frontend/
├── public/
│   └── assets/
│       ├── images/
│       └── icons/
├── src/
│   ├── api/                    # API client
│   │   ├── client.js          # Axios instance with interceptors
│   │   ├── auth.api.js
│   │   ├── events.api.js
│   │   ├── tickets.api.js
│   │   ├── purchases.api.js
│   │   ├── checkin.api.js
│   │   ├── refunds.api.js
│   │   ├── admin.api.js
│   │   └── organizer.api.js
│   ├── components/             # Reusable components
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   └── DatePicker.jsx
│   │   ├── forms/             # Form components
│   │   │   ├── PasswordInput.jsx
│   │   │   ├── PasswordStrengthMeter.jsx
│   │   │   ├── FormField.jsx
│   │   │   └── FileUpload.jsx
│   │   ├── security/          # Security components
│   │   │   ├── MFASetup.jsx
│   │   │   ├── MFACodeInput.jsx
│   │   │   └── SessionManager.jsx
│   │   └── charts/            # Chart components
│   │       ├── RevenueChart.jsx
│   │       ├── UserGrowthChart.jsx
│   │       └── SalesChart.jsx
│   ├── features/              # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── ForgotPasswordForm.jsx
│   │   │   │   ├── ResetPasswordForm.jsx
│   │   │   │   ├── ChangePasswordForm.jsx
│   │   │   │   └── EmailVerification.jsx
│   │   │   └── hooks/
│   │   │       └── useAuth.js
│   │   ├── events/
│   │   │   ├── components/
│   │   │   │   ├── EventCard.jsx
│   │   │   │   ├── EventList.jsx
│   │   │   │   ├── EventDetail.jsx
│   │   │   │   ├── EventForm.jsx
│   │   │   │   └── TicketTypeSelector.jsx
│   │   │   └── hooks/
│   │   │       └── useEvents.js
│   │   ├── tickets/
│   │   │   ├── components/
│   │   │   │   ├── TicketCard.jsx
│   │   │   │   ├── TicketList.jsx
│   │   │   │   ├── TicketQRCode.jsx
│   │   │   │   └── TicketDownload.jsx
│   │   │   └── hooks/
│   │   │       └── useTickets.js
│   │   ├── checkout/
│   │   │   ├── components/
│   │   │   │   ├── CheckoutForm.jsx
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   ├── OrderSummary.jsx
│   │   │   │   └── PurchaseConfirmation.jsx
│   │   │   └── hooks/
│   │   │       └── useCheckout.js
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── DashboardOverview.jsx
│   │   │   │   ├── UpcomingEvents.jsx
│   │   │   │   ├── RecentPurchases.jsx
│   │   │   │   └── QuickStats.jsx
│   │   │   └── hooks/
│   │   │       └── useDashboard.js
│   │   ├── checkin/
│   │   │   ├── components/
│   │   │   │   ├── QRScanner.jsx
│   │   │   │   ├── CheckInInterface.jsx
│   │   │   │   └── CheckInList.jsx
│   │   │   └── hooks/
│   │   │       └── useCheckIn.js
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── EventManagement.jsx
│   │   │   │   ├── ActivityLogs.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── RefundManagement.jsx
│   │   │   │   └── PaymentMonitoring.jsx
│   │   │   └── hooks/
│   │   │       └── useAdmin.js
│   │   └── organizer/
│   │       ├── components/
│   │       │   ├── OrganizerDashboard.jsx
│   │       │   ├── EventAnalytics.jsx
│   │       │   ├── SalesReport.jsx
│   │       │   └── TicketManagement.jsx
│   │       └── hooks/
│   │           └── useOrganizer.js
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   ├── usePasswordStrength.js
│   │   ├── useRateLimit.js
│   │   └── useLocalStorage.js
│   ├── layouts/               # Layout components
│   │   ├── AppLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── OrganizerLayout.jsx
│   │   └── StaffLayout.jsx
│   ├── pages/                 # Page components
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── MFASetupPage.jsx
│   │   │   └── EmailVerificationPage.jsx
│   │   ├── Events/
│   │   │   ├── EventListPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   └── CreateEventPage.jsx
│   │   ├── Tickets/
│   │   │   ├── MyTicketsPage.jsx
│   │   │   └── TicketDetailPage.jsx
│   │   ├── Checkout/
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── ConfirmationPage.jsx
│   │   ├── Dashboard/
│   │   │   ├── UserDashboardPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── CheckIn/
│   │   │   └── CheckInPage.jsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── UserManagementPage.jsx
│   │   │   ├── EventManagementPage.jsx
│   │   │   ├── ActivityLogsPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── RefundManagementPage.jsx
│   │   │   └── PaymentMonitoringPage.jsx
│   │   ├── Organizer/
│   │   │   ├── OrganizerDashboardPage.jsx
│   │   │   ├── MyEventsPage.jsx
│   │   │   ├── EventAnalyticsPage.jsx
│   │   │   └── SalesReportPage.jsx
│   │   └── Staff/
│   │       └── StaffDashboardPage.jsx
│   ├── routes/                # Routing
│   │   ├── AppRouter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── services/              # Services
│   │   ├── auth.service.js
│   │   ├── storage.service.js
│   │   └── export.service.js
│   ├── utils/                 # Utilities
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── constants.js
│   │   └── errorHandler.js
│   ├── styles/                # Global styles
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## API BASE URL

```
http://localhost:3000/api
```

All API endpoints are prefixed with `/api`. See complete API documentation below.

---

## COMPLETE API ENDPOINTS

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Private | Logout user |
| GET | `/api/auth/profile` | Private | Get current user profile |
| PUT | `/api/auth/profile` | Private | Update user profile |
| POST | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password |
| POST | `/api/auth/mfa/setup` | Private | Setup MFA |
| POST | `/api/auth/mfa/verify` | Private | Verify and enable MFA |
| POST | `/api/auth/mfa/disable` | Private | Disable MFA |
| POST | `/api/auth/verify-email` | Public | Verify email address |

### Events Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/events` | Public | Get all events |
| GET | `/api/events/:id` | Public | Get event by ID |
| GET | `/api/events/my-events` | Private (Organizer/Admin) | Get organizer's events |
| POST | `/api/events` | Private (Organizer/Admin) | Create event |
| PUT | `/api/events/:id` | Private (Organizer/Admin) | Update event |
| DELETE | `/api/events/:id` | Private (Organizer/Admin) | Delete event |
| POST | `/api/events/:id/publish` | Private (Organizer/Admin) | Publish event |

### Tickets Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tickets/event/:eventId/types` | Public | Get ticket types for event |
| GET | `/api/tickets/my-tickets` | Private | Get user's tickets |
| GET | `/api/tickets/:id` | Private | Get ticket by ID |
| GET | `/api/tickets/:id/qr` | Private | Get QR code for ticket |
| POST | `/api/tickets/event/:eventId/types` | Private (Organizer/Admin) | Create ticket type |
| PUT | `/api/tickets/types/:id` | Private (Organizer/Admin) | Update ticket type |
| DELETE | `/api/tickets/types/:id` | Private (Organizer/Admin) | Delete ticket type |

**Note:** When creating a purchase, use `ticketTypeId` (not `ticketId`) in the tickets array. Individual Ticket documents are created automatically after payment success.

### Purchases Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/purchases` | Private | Create purchase (initiate payment) |
| GET | `/api/purchases/my-purchases` | Private | Get user's purchases |
| GET | `/api/purchases/:id` | Private | Get purchase by ID |
| GET | `/api/purchases/transaction/:transactionId` | Private | Get purchase by transaction ID (for payment verification) |
| GET | `/api/purchases/:id/tickets` | Private | Get tickets for a purchase |

### Check-in Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/checkin` | Private (Staff/Organizer/Admin) | Check-in ticket using QR code |
| GET | `/api/checkin/ticket/:ticketId` | Private | Get check-in status |
| GET | `/api/checkin/event/:id` | Private (Staff/Organizer/Admin) | Get check-ins for event |

### Refunds Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/refunds` | Private | Request refund |
| GET | `/api/refunds/my-refunds` | Private | Get user's refunds |
| GET | `/api/refunds/organizer` | Private (Organizer/Admin) | Get organizer's refunds (for their events) |
| POST | `/api/refunds/:id/process` | Private (Organizer/Admin) | Process refund request |

### Admin Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Private (Admin) | Get all users |
| GET | `/api/admin/users/:id` | Private (Admin) | Get user by ID |
| PUT | `/api/admin/users/:id` | Private (Admin) | Update user |
| GET | `/api/admin/activity-logs` | Private (Admin) | Get activity logs |
| GET | `/api/admin/statistics` | Private (Admin) | Get statistics |
| GET | `/api/admin/refunds` | Private (Admin) | Get all refunds |
| GET | `/api/admin/purchases` | Private (Admin) | Get all purchases |

### Organizer Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/organizer/statistics` | Private (Organizer/Admin) | Get organizer statistics |
| GET | `/api/organizer/events/:eventId/analytics` | Private (Organizer/Admin) | Get event sales analytics |

---

## PORTAL-SPECIFIC FEATURES

### 1. USER PORTAL (`/dashboard`)

**Features:**
- Dashboard overview with stats
- Browse events
- View event details
- Purchase tickets
- My tickets page
- My purchases page
- Request refunds
- Profile management
- Security settings (MFA, password change)
- View ticket QR codes

**Pages:**
- `/dashboard` - User dashboard
- `/events` - Browse events
- `/events/:id` - Event details
- `/checkout` - Checkout page
- `/purchase/success` - Purchase confirmation
- `/my-tickets` - My tickets
- `/my-purchases` - My purchases
- `/settings` - Settings page

---

### 2. ORGANIZER PORTAL (`/organizer/dashboard`)

**Features:**
- Dashboard with event statistics
- Create events
- Manage events (edit, delete, publish)
- Create ticket types
- View event analytics
- Sales reports
- Manage refunds for their events
- View check-ins for their events

**Pages:**
- `/organizer/dashboard` - Organizer dashboard
- `/organizer/events` - My events list
- `/organizer/events/create` - Create event
- `/organizer/events/:id/edit` - Edit event
- `/organizer/events/:id/analytics` - Event analytics
- `/organizer/sales` - Sales reports
- `/organizer/refunds` - Refund management

---

### 3. STAFF PORTAL (`/staff/dashboard`)

**Features:**
- Check-in dashboard
- QR code scanner
- Manual ticket entry
- View check-in list
- Check-in statistics
- Event-specific check-ins

**Pages:**
- `/staff/dashboard` - Staff dashboard
- `/staff/checkin` - Check-in interface
- `/staff/checkin/event/:id` - Event check-ins

---

### 4. ADMIN PORTAL (`/admin/dashboard`)

**Features:**
- System-wide dashboard
- User management (view, edit, activate/deactivate, change roles)
- Event management (view all, moderate)
- Activity logs and audit trail
- Analytics and reports
- Refund management
- Payment monitoring
- System statistics

**Pages:**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/:id` - User details
- `/admin/events` - Event management
- `/admin/activity-logs` - Activity logs
- `/admin/analytics` - Analytics
- `/admin/refunds` - Refund management
- `/admin/payments` - Payment monitoring

---

## CORE FEATURES IMPLEMENTATION

### Authentication UI

#### Registration Page
- Form fields: Email, Password, Confirm Password, First Name, Last Name, Phone (optional)
- Real-time password strength meter (0-100 score)
- Password requirements checklist
- Email validation
- Submit with loading state
- Redirect to email verification on success

#### Login Page
- Email and password fields
- MFA code field (conditional, shown if MFA enabled)
- "Forgot Password" link
- Remember me checkbox
- Failed attempt count display
- Account lockout message with timestamp
- Rate limiting display

#### Password Change Page
- Current password field
- New password with strength meter
- Confirm password
- Password expiration warning
- Cannot reuse last 5 passwords

#### MFA Setup Page
- QR code display
- Manual entry code
- Verification input
- Backup codes display (10 codes)
- Download backup codes option

### Event Management UI

#### Event List Page
- Grid/list view toggle
- Search bar
- Filters: Category, Date, Location, Price
- Pagination
- Event cards with image, title, date, venue, price range

#### Event Detail Page
- Large event image/banner
- Title, description, date, time, venue
- Available ticket types with prices
- Quantity selector per ticket type
- Price calculation
- "Buy Tickets" button
- Real-time availability updates

#### Create/Edit Event Page
- Form sections: Basic Info, Date & Time, Location, Images, Ticket Types
- Image upload (Cloudinary)
- Ticket type management (add/remove)
- Save as draft / Publish toggle
- Validation for all fields

### Checkout & Payment

#### Checkout Page
- Order summary
- Selected tickets with quantities
- Subtotal, fees, total
- Attendee information form
- Payment button (redirects to eSewa)

#### Purchase Confirmation Page
- Success message
- Order number
- Purchase summary
- Ticket QR codes (downloadable)
- "View My Tickets" button

### User Dashboard

#### Dashboard Overview
- Welcome message
- Quick stats: Total tickets, Upcoming events, Total spent
- Upcoming events (next 5)
- Recent purchases
- Quick actions

#### My Tickets Page
- List of purchased tickets
- Event details
- Ticket status (confirmed, checked-in, refunded)
- QR codes (expandable)
- Filters: All, Upcoming, Past, Refunded
- Download ticket option

### Organizer Dashboard

#### Dashboard Overview
- Total events
- Published events
- Total revenue
- Total tickets sold
- Pending refunds
- Revenue chart (last 6 months)
- Recent events

#### Event Analytics Page
- Event summary
- Total revenue
- Tickets sold
- Sales by ticket type
- Sales by day
- Recent purchases list

### Staff Dashboard

#### Check-in Interface
- QR code scanner (camera access)
- Manual ticket ID entry
- Display on scan: Attendee name, Event name, Ticket type, Status
- Check-in button
- Real-time check-in count
- Recent check-ins list

### Admin Dashboard

#### Dashboard Overview
- System statistics cards
- Revenue chart
- User growth chart
- Recent activity feed
- Quick actions

#### User Management
- User list table with search and filters
- Role filter, Status filter
- Pagination
- Actions: View, Edit role, Activate/Deactivate
- User details modal

#### Activity Logs
- Log table with filters
- Search functionality
- Export to CSV
- Filter by: User, Activity type, Date range, Severity

#### Analytics
- Revenue analytics
- User analytics
- Event analytics
- Ticket analytics
- Date range selection
- Export charts

---

## DESIGN SYSTEM

### Color Palette

```javascript
// Primary Colors
primary: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6', // Main blue
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
}

// Accent Colors (Gradients)
gradient: {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
}

// Status Colors
success: '#10b981',
error: '#ef4444',
warning: '#f59e0b',
info: '#3b82f6',
```

### Typography

- **Headings**: Inter, bold, large sizes
- **Body**: Inter, regular, 16px base
- **Code**: JetBrains Mono

### Components

#### Buttons
- Primary: Blue gradient, white text
- Secondary: Gray border, gray text
- Danger: Red background, white text
- Sizes: sm, md, lg
- Loading state with spinner

#### Cards
- White background
- Shadow: `shadow-lg`
- Rounded corners: `rounded-xl`
- Hover effects

#### Forms
- Input fields with labels
- Error messages below inputs
- Success indicators
- Required field indicators

### Responsive Design

- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (multi-column)

---

## STATE MANAGEMENT

### Server State
- **React Query** for all API calls
- Query keys organized by feature
- Automatic refetching on window focus
- Optimistic updates for mutations

### Client State
- **React Context** for:
  - Auth state (user, tokens, isAuthenticated)
  - Theme preferences
- **Local State** (useState) for:
  - Component-level state
  - Form state (Formik)

---

## ROUTING STRUCTURE

```javascript
// Public Routes
/ - Home/Events list
/events - Events list
/events/:id - Event details
/login - Login
/register - Register
/forgot-password - Forgot password
/reset-password - Reset password

// Protected Routes (User)
/dashboard - User dashboard
/my-tickets - My tickets
/my-purchases - My purchases
/checkout - Checkout
/purchase/success - Purchase success
/settings - Settings

// Protected Routes (Organizer)
/organizer/dashboard - Organizer dashboard
/organizer/events - My events
/organizer/events/create - Create event
/organizer/events/:id/edit - Edit event
/organizer/events/:id/analytics - Event analytics
/organizer/sales - Sales reports

// Protected Routes (Staff)
/staff/dashboard - Staff dashboard
/staff/checkin - Check-in interface
/staff/checkin/event/:id - Event check-ins

// Protected Routes (Admin)
/admin/dashboard - Admin dashboard
/admin/users - User management
/admin/users/:id - User details
/admin/events - Event management
/admin/activity-logs - Activity logs
/admin/analytics - Analytics
/admin/refunds - Refund management
/admin/payments - Payment monitoring
```

---

## API CLIENT SETUP

```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', response.data.data.accessToken);
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return apiClient(error.config);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## AUTHENTICATION FLOW

1. **Login**: User enters email/password → API returns tokens + user data → Store in localStorage → Redirect based on role
2. **Token Refresh**: On 401, automatically refresh token using refreshToken
3. **Logout**: Clear localStorage → Call logout API → Redirect to login
4. **Protected Routes**: Check authentication → Check role → Render or redirect

---

## ERROR HANDLING

- Consistent error format from backend
- User-friendly error messages
- Error codes for support
- Retry options for network errors
- Toast notifications for errors

---

## LOADING STATES

- Skeleton screens for data loading
- Spinners for actions
- Progress bars for uploads
- Optimistic updates with rollback

---

## ACCESSIBILITY

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader support
- Focus management
- WCAG AA color contrast
- Semantic HTML

---

## PERFORMANCE OPTIMIZATION

- Code splitting with React.lazy
- Image optimization
- API response caching (React Query)
- Debounced search inputs
- Virtualized lists for large data

---

## SECURITY FEATURES

- Token storage in localStorage (consider httpOnly cookies for production)
- Automatic token refresh
- Password strength meter
- MFA support
- Rate limiting display
- Account lockout warnings
- Session management

---

## TESTING (Optional)

- Unit tests for utilities
- Integration tests for API calls
- E2E tests for critical flows

---

## DEPLOYMENT

- Environment variables for API URL
- Build optimization
- Error tracking (Sentry)
- Analytics (optional)

---

## ADDITIONAL FEATURES (Optional)

- Dark mode toggle
- Real-time notifications (WebSocket)
- Email notifications
- Export data (CSV, PDF)
- Advanced search
- Bulk operations
- System health monitoring

---

## IMPLEMENTATION PRIORITY

1. **Phase 1**: Authentication, User Portal, Basic Event Browsing
2. **Phase 2**: Organizer Portal, Event Creation, Ticket Management
3. **Phase 3**: Staff Portal, Check-in System
4. **Phase 4**: Admin Portal, Analytics, Advanced Features

---

This is a complete, production-ready frontend prompt. Implement following this structure and you'll have a fully functional, secure, and user-friendly event management system frontend.


