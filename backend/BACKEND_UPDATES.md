# Backend Updates Summary

## Changes Made to Align with Frontend Requirements

### 1. Fixed Purchase Flow

**Issue:** Purchase controller was trying to use `Ticket.findById()` but tickets don't exist until after payment.

**Fix:**
- Changed purchase creation to use `TicketType` instead of `Ticket`
- Updated Purchase model to reference `ticketTypeId` instead of `ticketId`
- Updated validation to check `TicketType` availability

**Files Changed:**
- `controllers/purchases.controller.js`
- `models/Purchase.js`
- `routes/purchases.routes.js`

### 2. Fixed Webhook to Create Tickets

**Issue:** Webhook was trying to update tickets that didn't exist yet.

**Fix:**
- Webhook now creates individual `Ticket` documents after payment success
- Each ticket gets a unique QR code
- Updates `TicketType.quantitySold` correctly
- Prevents duplicate processing

**Files Changed:**
- `routes/webhooks.routes.js`

### 3. Added Missing Endpoints

#### Purchase Verification
- `GET /api/purchases/transaction/:transactionId` - Get purchase by transaction ID (for payment success page)

#### Get Purchase Tickets
- `GET /api/purchases/:id/tickets` - Get all tickets for a purchase

#### Organizer Refunds
- `GET /api/refunds/organizer` - Get refunds for organizer's events

**Files Changed:**
- `controllers/purchases.controller.js`
- `controllers/refunds.controller.js`
- `routes/purchases.routes.js`
- `routes/refunds.routes.js`

### 4. Updated API Request Format

**Purchase Creation:**
```javascript
// OLD (incorrect)
{
  eventId: "...",
  tickets: [
    { ticketId: "...", quantity: 2 }
  ]
}

// NEW (correct)
{
  eventId: "...",
  tickets: [
    { ticketTypeId: "...", quantity: 2 }
  ]
}
```

## Complete API Endpoint List

### Authentication
- ✅ POST `/api/auth/register`
- ✅ POST `/api/auth/login`
- ✅ POST `/api/auth/refresh`
- ✅ POST `/api/auth/logout`
- ✅ GET `/api/auth/profile`
- ✅ PUT `/api/auth/profile`
- ✅ POST `/api/auth/change-password`
- ✅ POST `/api/auth/forgot-password`
- ✅ POST `/api/auth/reset-password`
- ✅ POST `/api/auth/mfa/setup`
- ✅ POST `/api/auth/mfa/verify`
- ✅ POST `/api/auth/mfa/disable`
- ✅ POST `/api/auth/verify-email`

### Events
- ✅ GET `/api/events`
- ✅ GET `/api/events/:id`
- ✅ GET `/api/events/my-events`
- ✅ POST `/api/events`
- ✅ PUT `/api/events/:id`
- ✅ DELETE `/api/events/:id`
- ✅ POST `/api/events/:id/publish`

### Tickets
- ✅ GET `/api/tickets/event/:eventId/types`
- ✅ GET `/api/tickets/my-tickets`
- ✅ GET `/api/tickets/:id`
- ✅ GET `/api/tickets/:id/qr`
- ✅ POST `/api/tickets/event/:eventId/types`
- ✅ PUT `/api/tickets/types/:id`
- ✅ DELETE `/api/tickets/types/:id`

### Purchases
- ✅ POST `/api/purchases` (uses `ticketTypeId`)
- ✅ GET `/api/purchases/my-purchases`
- ✅ GET `/api/purchases/:id`
- ✅ GET `/api/purchases/transaction/:transactionId` (NEW)
- ✅ GET `/api/purchases/:id/tickets` (NEW)

### Check-in
- ✅ POST `/api/checkin`
- ✅ GET `/api/checkin/ticket/:ticketId`
- ✅ GET `/api/checkin/event/:id`

### Refunds
- ✅ POST `/api/refunds`
- ✅ GET `/api/refunds/my-refunds`
- ✅ GET `/api/refunds/organizer` (NEW)
- ✅ POST `/api/refunds/:id/process`

### Admin
- ✅ GET `/api/admin/users`
- ✅ GET `/api/admin/users/:id`
- ✅ PUT `/api/admin/users/:id`
- ✅ GET `/api/admin/activity-logs`
- ✅ GET `/api/admin/statistics`
- ✅ GET `/api/admin/refunds`
- ✅ GET `/api/admin/purchases`

### Organizer
- ✅ GET `/api/organizer/statistics`
- ✅ GET `/api/organizer/events/:eventId/analytics`

### Webhooks
- ✅ POST `/api/webhooks/esewa`

## Data Flow

### Purchase Flow (Corrected)
1. User selects ticket types → Frontend sends `ticketTypeId` array
2. Backend validates `TicketType` availability
3. Creates `Purchase` with status `PENDING`
4. Returns payment URL
5. User completes payment → eSewa redirects
6. Webhook receives payment confirmation
7. Webhook creates individual `Ticket` documents
8. Updates `TicketType.quantitySold`
9. Updates `Event` statistics
10. Sends confirmation email

### Ticket Structure
- `TicketType`: Template/configuration (price, quantity available)
- `Ticket`: Individual ticket instance (one per attendee, with QR code)
- `Purchase`: Transaction record (contains ticket types purchased)

## Testing Checklist

- [ ] Create purchase with ticket types
- [ ] Verify payment webhook creates tickets
- [ ] Get purchase by transaction ID
- [ ] Get tickets for a purchase
- [ ] Organizer can view refunds for their events
- [ ] QR codes are generated correctly
- [ ] Ticket quantities update correctly

## Notes

- All endpoints are now aligned with frontend requirements
- Purchase flow correctly uses TicketType → Ticket creation
- Individual tickets are created after payment success
- QR codes are generated per ticket (not per purchase)
- All missing endpoints have been added





