# Feature 3.5: Payment Gateway Integration (Stripe API)

## Prompt for Antigravity - Member-3

Copy and paste this entire prompt to Antigravity to implement Feature 3.5:

---

## 🎯 IMPLEMENTATION REQUEST

I need to implement **Module 3 Feature 5: Payment Gateway Integration** for our Urban Maid Service MERN stack project.

### Feature Requirement:
> "Implements the secure online payment process using the Stripe API. Handles payment intent creation, confirmation, and saves the final transaction status (successful, failed). No sensitive card data is stored on the server."

---

## 📋 EXISTING PROJECT CONTEXT

Our project already has:
- **Booking System** - Customers can book maids (Module 2 Feature 2)
- **Service Categories** - Admin creates categories with pricing tiers
- **Booking Model** - Has `totalPrice` field calculated from selected tier
- **Booking Status Flow**: `pending → accepted → completed`

Currently, when a booking is created, no actual payment is processed - we need to add Stripe payment.

---

## 🔧 WHAT NEEDS TO BE IMPLEMENTED

### 1. Backend - Payment Controller (`server/controllers/paymentController.js`)

Create endpoints:
- `POST /api/payments/create-intent` - Create Stripe Payment Intent
- `POST /api/payments/confirm` - Confirm payment after customer pays
- `GET /api/payments/history` - Get user's payment history

### 2. Backend - Payment Model (`server/models/Payment.js`)

Create schema with fields:
- `booking` - Reference to Booking
- `customer` - Reference to User
- `amount` - Payment amount
- `currency` - Default "BDT" (Bangladeshi Taka)
- `stripePaymentIntentId` - Stripe's payment intent ID
- `status` - enum: ['pending', 'succeeded', 'failed', 'refunded']
- `paymentMethod` - Card type info
- `paidAt` - Timestamp when payment succeeded
- timestamps

### 3. Backend - Payment Routes (`server/routes/paymentRoutes.js`)

Protected routes (require auth):
- POST `/create-intent`
- POST `/confirm`
- GET `/history`

### 4. Frontend - Payment Component (`client/src/components/payment/PaymentForm.js`)

Using **@stripe/react-stripe-js** and **@stripe/stripe-js**:
- Card element for entering card details
- Handle payment submission
- Show success/error messages
- Redirect after successful payment

### 5. Modify Booking Flow

Update `BookingForm.js` to:
- After booking details are filled, proceed to payment
- Only create booking after payment succeeds
- OR create booking as "pending_payment" status, then update after payment

---

## 🔑 STRIPE SETUP REQUIRED

1. Install packages:
```bash
# Server
cd server
npm install stripe

# Client
cd client
npm install @stripe/react-stripe-js @stripe/stripe-js
```

2. Add to `server/.env`:
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

3. Add to `client/.env`:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Note:** Use Stripe TEST keys for development. Get them from https://dashboard.stripe.com/test/apikeys

---

## 📊 PAYMENT FLOW TO IMPLEMENT

```
Customer selects service & tier → Booking form filled
                                        ↓
                            Create Payment Intent (backend)
                                        ↓
                            Return clientSecret to frontend
                                        ↓
                            Customer enters card in Stripe Elements
                                        ↓
                            Stripe processes payment
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    ↓                                       ↓
            Payment Succeeded                        Payment Failed
                    ↓                                       ↓
            Create/Update Booking                   Show Error Message
            Save Payment Record                     Allow Retry
            Show Success + Receipt
```

---

## ⚠️ IMPORTANT REQUIREMENTS

1. **NO card data on our server** - Stripe handles all sensitive data
2. **Use Stripe Elements** - Pre-built UI components for card input
3. **Save transaction status** - Record all payment attempts in database
4. **Error handling** - Handle declined cards, network errors, etc.
5. **Idempotency** - Prevent duplicate charges

---

## 📁 FILES TO CREATE/MODIFY

### NEW FILES:
- `server/models/Payment.js`
- `server/controllers/paymentController.js`
- `server/routes/paymentRoutes.js`
- `client/src/components/payment/PaymentForm.js`
- `client/src/components/payment/PaymentSuccess.js`

### MODIFY:
- `server/server.js` - Add payment routes
- `client/src/App.js` - Add payment routes
- `client/src/components/booking/BookingForm.js` - Integrate payment step

---

## 🧪 TESTING

After implementation:
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date (e.g., 12/25)
3. Any CVC (e.g., 123)
4. Any ZIP code

Test scenarios:
- Successful payment
- Declined card: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

---

## 📦 EXPECTED DELIVERABLES

1. ✅ Payment Intent creation API
2. ✅ Payment confirmation API
3. ✅ Payment history API
4. ✅ Payment model with all transactions saved
5. ✅ React Stripe Elements integration
6. ✅ Payment form UI
7. ✅ Success/failure handling
8. ✅ Integration with existing booking flow

---

Please implement this feature following the existing project structure and coding patterns. Check the existing `authController.js` and `bookingController.js` for code style reference.

---

## END OF PROMPT

