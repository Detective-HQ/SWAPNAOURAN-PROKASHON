# E-commerce Book Platform Backend

Production-ready backend for a book commerce platform with:

- JWT authentication (USER/ADMIN roles)
- Prisma + PostgreSQL
- Book management (physical + e-book)
- Order/payment flow (Razorpay + Mock, Stripe optional)
- QR code generation and verification
- E-book access control + secure PDF streaming
- Gallery management
- Admin dashboard analytics

## 1. Step-by-step setup

1. Go to backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update `.env` values for your PostgreSQL, JWT, payment, and storage setup.
   - Prisma CLI and the runtime client both read `DATABASE_URL` from `backend/.env`.
   - Prisma CLI is configured in `backend/prisma.config.ts`, so `.env` is the single place to update your database connection.
   - For India: set `PAYMENT_PROVIDER=RAZORPAY` and add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

5. Generate Prisma client and run migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

6. (Optional) Create admin user:

```bash
npm run seed:admin
```

7. Start server:

```bash
npm run dev
```

Server runs on: `http://localhost:5000` by default.

## 2. Project structure

Prisma CLI config lives in `backend/prisma.config.ts`.

```text
backend/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ config/
│  │  ├─ cloudinary.js
│  │  └─ env.js
│  ├─ controllers/
│  │  ├─ adminController.js
│  │  ├─ authController.js
│  │  ├─ bookController.js
│  │  ├─ ebookController.js
│  │  ├─ galleryController.js
│  │  ├─ orderController.js
│  │  └─ qrController.js
│  ├─ middleware/
│  │  ├─ adminMiddleware.js
│  │  ├─ authMiddleware.js
│  │  ├─ errorMiddleware.js
│  │  └─ validate.js
│  ├─ prisma/
│  │  └─ client.js
│  ├─ routes/
│  │  ├─ adminRoutes.js
│  │  ├─ authRoutes.js
│  │  ├─ bookRoutes.js
│  │  ├─ ebookRoutes.js
│  │  ├─ galleryRoutes.js
│  │  ├─ index.js
│  │  ├─ orderRoutes.js
│  │  └─ qrRoutes.js
│  ├─ services/
│  │  ├─ analyticsService.js
│  │  ├─ ebookService.js
│  │  ├─ invoiceService.js
│  │  ├─ orderService.js
│  │  ├─ paymentService.js
│  │  ├─ qrService.js
│  │  └─ storageService.js
│  ├─ scripts/
│  │  └─ createAdmin.js
│  ├─ utils/
│  │  ├─ ApiError.js
│  │  ├─ asyncHandler.js
│  │  ├─ jwt.js
│  │  └─ response.js
│  ├─ validations/
│  │  ├─ authValidation.js
│  │  ├─ bookValidation.js
│  │  ├─ ebookValidation.js
│  │  ├─ galleryValidation.js
│  │  ├─ orderValidation.js
│  │  └─ qrValidation.js
│  ├─ app.js
│  └─ server.js
├─ uploads/
├─ .env.example
├─ package.json
└─ README.md
```

## 3. Important API routes

Base URL: `/api`

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### Books

- `GET /books`
- `GET /books/:id`
- `POST /books` (admin)
- `PUT /books/:id` (admin)
- `DELETE /books/:id` (admin)

### Orders + Payments

- `POST /orders`
- `GET /orders/my`
- `GET /orders/:id`
- `POST /orders/:orderId/pay`
- `POST /orders/:orderId/verify`
- `GET /orders/:id/invoice`

### E-book Access

- `GET /ebooks/:id/read`
- `GET /ebooks/:id/stream?token=...`

### Admin Dashboard

- `GET /admin/users`
- `GET /admin/books`
- `GET /admin/orders`
- `GET /admin/analytics`

### Gallery

- `GET /gallery`
- `POST /gallery` (admin, multipart/form-data: `image`)
- `DELETE /gallery/:id` (admin)

### QR

- `GET /qr/verify/:id` (auth)

## 4. Sample responses

### Signup success

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

### Create order success

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "id": "ord_123",
    "status": "PENDING",
    "totalAmount": "599.00",
    "items": [
      {
        "bookId": "book_1",
        "quantity": 1
      }
    ]
  }
}
```

### Payment verify (MOCK) success

```json
{
  "success": true,
  "message": "Payment verified and order updated",
  "data": {
    "id": "ord_123",
    "status": "PAID"
  }
}
```

### Razorpay verify request body

```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ456",
  "razorpay_signature": "hmac_signature_from_razorpay"
}
```

### E-book access denied

```json
{
  "success": false,
  "message": "Access Denied"
}
```

## 5. Payment flow (summary)

1. User creates order (`PENDING`).
2. User initiates payment (`/orders/:orderId/pay`).
   - For Razorpay, API returns `checkoutData` for frontend checkout.
3. User verifies payment (`/orders/:orderId/verify`).
   - Razorpay verify uses: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
4. On success:
   - Order status becomes `PAID`
   - Payment status becomes `SUCCESS`
   - `EbookAccess` created for e-books
   - QR codes generated for all order items

## 6. Security notes

- Passwords hashed with bcrypt.
- JWT-protected routes.
- Admin-only middleware for management APIs.
- E-book URLs are never returned directly.
- Streaming is tokenized through secure backend endpoint.
- Input validation using Zod.
