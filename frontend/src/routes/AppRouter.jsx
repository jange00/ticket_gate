import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import OrganizerLayout from '../layouts/OrganizerLayout';
import StaffLayout from '../layouts/StaffLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Public pages
import HomePage from '../pages/HomePage';
import EventListPage from '../pages/Events/EventListPage';
import EventDetailPage from '../pages/Events/EventDetailPage';

// Auth pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import EmailVerificationPage from '../pages/Auth/EmailVerificationPage';
import MFASetupPage from '../pages/Auth/MFASetupPage';
import Verify2FALogin from '../pages/Auth/Verify2FALogin';

// Dashboard pages
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UserDashboardPage from '../pages/Dashboard/UserDashboardPage';
import OrganizerDashboardPage from '../pages/Dashboard/OrganizerDashboardPage';
import StaffDashboardPage from '../pages/Dashboard/StaffDashboardPage';
import MyPurchasesPage from '../pages/Dashboard/MyPurchasesPage';
import SettingsPage from '../pages/Dashboard/SettingsPage';
import RefundsPage from '../pages/Dashboard/RefundsPage';

// Event pages
import CreateEventPage from '../pages/Events/CreateEventPage';
import EditEventPage from '../pages/Events/EditEventPage';

// Organizer pages
import MyEventsPage from '../pages/Organizer/MyEventsPage';
import EventAnalyticsPage from '../pages/Organizer/EventAnalyticsPage';
import SalesReportsPage from '../pages/Organizer/SalesReportsPage';
import RefundManagementPage from '../pages/Organizer/RefundManagementPage';

// Admin pages
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import EventManagementPage from '../pages/Admin/EventManagementPage';
import AnalyticsPage from '../pages/Admin/AnalyticsPage';
import PaymentMonitoringPage from '../pages/Admin/PaymentMonitoringPage';
import ActivityLogsPage from '../pages/Admin/ActivityLogsPage';
import AdminRefundManagementPage from '../pages/Admin/RefundManagementPage';

// Staff pages
import CheckInPage from '../pages/CheckIn/CheckInPage';
import EventCheckInsPage from '../pages/Staff/EventCheckInsPage';
import CheckInHistoryPage from '../pages/Staff/CheckInHistoryPage';

// Ticket pages
import MyTicketsPage from '../pages/Tickets/MyTicketsPage';
import TicketDetailPage from '../pages/Tickets/TicketDetailPage';

// Checkout pages
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import ConfirmationPage from '../pages/Checkout/ConfirmationPage';

// Purchase pages
import PurchaseSuccessPage from '../pages/Purchase/PurchaseSuccessPage';
import PurchaseFailurePage from '../pages/Purchase/PurchaseFailurePage';

// Payment pages
import PaymentVerifyPage from '../pages/Payment/PaymentVerifyPage';

// Other pages
import UnauthorizedPage from '../pages/UnauthorizedPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventListPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<EmailVerificationPage />} />
          <Route path="login/2fa" element={<Verify2FALogin />} />
          <Route 
            path="mfa-setup" 
            element={
              <ProtectedRoute>
                <MFASetupPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* User Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tickets" element={<MyTicketsPage />} />
          <Route path="purchases" element={<MyPurchasesPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Organizer Routes */}
        <Route 
          path="/organizer" 
          element={
            <RoleRoute roles={['organizer', 'admin']}>
              <OrganizerLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<OrganizerDashboardPage />} />
          <Route path="events" element={<MyEventsPage />} />
          <Route path="analytics/:id" element={<EventAnalyticsPage />} />
          <Route path="sales" element={<SalesReportsPage />} />
          <Route path="refunds" element={<RefundManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={
            <RoleRoute roles={['staff', 'admin']}>
              <StaffLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboardPage />} />
          <Route path="checkins" element={<CheckInHistoryPage />} />
          <Route path="checkins/:eventId" element={<EventCheckInsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <RoleRoute roles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="events" element={<EventManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="refunds" element={<AdminRefundManagementPage />} />
          <Route path="payments" element={<PaymentMonitoringPage />} />
          <Route path="activity-logs" element={<ActivityLogsPage />} />
        </Route>

        {/* Protected Event Creation/Editing */}
        <Route 
          path="/events/create" 
          element={
            <RoleRoute roles={['organizer', 'admin']}>
              <AppLayout />
            </RoleRoute>
          }
        >
          <Route index element={<CreateEventPage />} />
        </Route>

        <Route 
          path="/events/:id/edit" 
          element={
            <RoleRoute roles={['organizer', 'admin']}>
              <AppLayout />
            </RoleRoute>
          }
        >
          <Route index element={<EditEventPage />} />
        </Route>

        {/* Check-in Routes */}
        <Route 
          path="/checkin" 
          element={
            <RoleRoute roles={['staff', 'admin']}>
              <AppLayout />
            </RoleRoute>
          }
        >
          <Route index element={<CheckInPage />} />
        </Route>

        {/* Checkout Routes */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CheckoutPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* Payment Verification Route */}
        <Route path="/payment" element={<AppLayout />}>
          <Route path="verify" element={<PaymentVerifyPage />} />
        </Route>

        {/* Purchase Result Routes */}
        <Route path="/purchase" element={<AppLayout />}>
          <Route path="success" element={<PurchaseSuccessPage />} />
          <Route path="failure" element={<PurchaseFailurePage />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
