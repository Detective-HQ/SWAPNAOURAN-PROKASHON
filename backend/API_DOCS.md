# Swapnaouran Prokashon Backend API Documentation

This documentation is generated from the current backend source code on April 3, 2026.

## 1. Base Information

- Base URL (local): `http://localhost:5000`
- API prefix: `/api`
- JSON content type: `application/json`
- File upload content type: `multipart/form-data`
- Auth header for protected routes: `Authorization: Bearer <access_token>`

## 2. Response Format

### Success response shape

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

`data` can be any JSON object, array, or `null`.

### Error response shape (general)

```json
{
  "success": false,
  "message": "Error message"
}
```

### Validation error shape (Zod)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

### Multer upload error shape

```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```

or

```json
{
  "success": false,
  "message": "File too large"
}
```

## 3. Authentication and Authorization

- Public routes: `/api/health`, `/api/auth/signup`, `/api/auth/login`, `GET /api/books`, `GET /api/books/:id`, `GET /api/gallery`
- Auth required: all `/api/orders/*`, all `/api/ebooks/*`, `/api/auth/me`, `/api/qr/verify/:id`
- Admin required: all `/api/admin/*`, `POST/PUT/DELETE /api/books*`, `POST/DELETE /api/gallery*`

### Access token

- Tokens are JWT access tokens returned by signup/login.
- Default expiry comes from `JWT_EXPIRES_IN` (default: `7d`).

## 4. Enums and Domain Values

- `Role`: `USER`, `ADMIN`
- `BookType`: `PHYSICAL`, `EBOOK`
- `OrderStatus`: `PENDING`, `PAID`, `FAILED`
- `PaymentStatus`: `CREATED`, `SUCCESS`, `FAILED`
- `PaymentProvider`: `MOCK`, `STRIPE`, `RAZORPAY`

## 5. Route Reference

## Health

### GET `/api/health`

- Auth: No
- Description: Health check endpoint.

#### Success `200`

```json
{
  "success": true,
  "message": "API is healthy"
}
```

## Auth

### POST `/api/auth/signup`

- Auth: No
- Description: Create a new user account with role `USER`.

#### Request body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | Yes | min length 2 |
| `email` | string | Yes | valid email |
| `password` | string | Yes | min length 8, at least 1 uppercase letter, at least 1 number |

#### Success `201`

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

#### Errors

- `400` validation failed
- `409` `"Email is already registered"`

### POST `/api/auth/login`

- Auth: No
- Description: Login with email/password.

#### Request body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | valid email |
| `password` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

#### Errors

- `400` validation failed
- `401` `"Invalid email or password"`

### GET `/api/auth/me`

- Auth: Yes
- Description: Fetch profile of currently authenticated user.

#### Success `200`

```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

#### Errors

- `401` `"Unauthorized"` (missing token)
- `401` `"Invalid token"` or `"Invalid or expired token"`

## Books

### GET `/api/books`

- Auth: No
- Description: List active books with optional filtering and pagination.

#### Query parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `type` | string | No | `PHYSICAL` or `EBOOK` |
| `search` | string | No | free text search in title/description |
| `page` | number | No | positive integer, default `1` |
| `limit` | number | No | positive integer, max `100`, default `10` |

#### Success `200`

```json
{
  "success": true,
  "message": "Books fetched",
  "data": {
    "items": [
      {
        "id": "book_1",
        "title": "Book Name",
        "description": "Long description...",
        "price": "599.00",
        "type": "PHYSICAL",
        "coverImage": "https://...",
        "isActive": true,
        "createdAt": "2026-04-03T10:00:00.000Z",
        "updatedAt": "2026-04-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### Errors

- `400` validation failed

### GET `/api/books/:id`

- Auth: No
- Description: Get one active book by ID.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Book fetched",
  "data": {
    "id": "book_1",
    "title": "Book Name",
    "description": "Long description...",
    "price": "599.00",
    "type": "EBOOK",
    "coverImage": "https://...",
    "isActive": true,
    "createdAt": "2026-04-03T10:00:00.000Z",
    "updatedAt": "2026-04-03T10:00:00.000Z"
  }
}
```

#### Errors

- `400` validation failed
- `404` `"Book not found"` (missing or inactive)

### POST `/api/books`

- Auth: Yes (`ADMIN`)
- Description: Create a book.

#### Request body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | min length 2 |
| `description` | string | Yes | min length 10 |
| `price` | number | Yes | positive |
| `type` | string | Yes | `PHYSICAL` or `EBOOK` |
| `coverImage` | string | No | valid URL |
| `fileUrl` | string | Conditionally | valid URL, required when `type=EBOOK` |
| `isActive` | boolean | No | defaults to true |

#### Success `201`

```json
{
  "success": true,
  "message": "Book created",
  "data": {
    "id": "book_1",
    "title": "Book Name",
    "description": "Long description...",
    "price": "599.00",
    "type": "EBOOK",
    "coverImage": "https://...",
    "fileUrl": "https://...",
    "isActive": true,
    "createdAt": "2026-04-03T10:00:00.000Z",
    "updatedAt": "2026-04-03T10:00:00.000Z"
  }
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `403` `"Admin access required"`

### PUT `/api/books/:id`

- Auth: Yes (`ADMIN`)
- Description: Update a book.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Request body

All fields from create book are optional. If `type=EBOOK`, `fileUrl` cannot be empty string.

#### Success `200`

```json
{
  "success": true,
  "message": "Book updated",
  "data": {
    "id": "book_1",
    "title": "Updated Book Name",
    "description": "Updated description...",
    "price": "699.00",
    "type": "PHYSICAL",
    "coverImage": "https://...",
    "fileUrl": null,
    "isActive": true,
    "createdAt": "2026-04-03T10:00:00.000Z",
    "updatedAt": "2026-04-03T11:00:00.000Z"
  }
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `403` admin required
- `404` `"Book not found"`

### DELETE `/api/books/:id`

- Auth: Yes (`ADMIN`)
- Description: Soft-delete a book by setting `isActive=false`.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Book deleted",
  "data": null
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `403` admin required
- `404` `"Book not found"`

## Orders and Payments

All `/api/orders/*` routes require authentication.

Important access rule from service logic:

- `USER` sees only their own orders.
- `ADMIN` is scoped to all orders on these endpoints.

### POST `/api/orders`

- Auth: Yes
- Description: Create an order with one or more items.

#### Request body

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `items` | array | Yes | minimum 1 item |
| `shippingAddress` | object | Conditionally | required when any ordered book type is `PHYSICAL` |

`items[]` object:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `bookId` | string | Yes | non-empty |
| `quantity` | number | No | positive integer, default `1` |

`shippingAddress` object:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `line1` | string | Yes if object provided | min length 2 |
| `line2` | string | No | optional |
| `city` | string | Yes if object provided | min length 2 |
| `state` | string | Yes if object provided | min length 2 |
| `postalCode` | string | Yes if object provided | min length 3 |
| `country` | string | Yes if object provided | min length 2 |

#### Success `201`

Returns the newly created order including `items` and embedded `book` details.

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "id": "ord_123",
    "userId": "usr_1",
    "status": "PENDING",
    "totalAmount": "599.00",
    "shippingAddress": {
      "line1": "Road 1",
      "city": "Dhaka",
      "state": "Dhaka",
      "postalCode": "1207",
      "country": "Bangladesh"
    },
    "invoiceNumber": null,
    "createdAt": "2026-04-03T10:00:00.000Z",
    "updatedAt": "2026-04-03T10:00:00.000Z",
    "items": [
      {
        "id": "oi_1",
        "orderId": "ord_123",
        "bookId": "book_1",
        "quantity": 1,
        "unitPrice": "599.00",
        "totalPrice": "599.00",
        "createdAt": "2026-04-03T10:00:00.000Z",
        "book": {
          "id": "book_1",
          "title": "Book Name",
          "type": "PHYSICAL"
        }
      }
    ]
  }
}
```

#### Errors

- `400` validation failed
- `400` `"Some books are invalid or inactive"`
- `400` `"Shipping address is required for physical books"`
- `401` unauthorized

### GET `/api/orders/my`

- Auth: Yes
- Description: List orders for requester scope.
- Note: for `ADMIN`, this returns all orders.

#### Success `200`

Returns array of orders with `user`, `items.book`, and `payment`.

```json
{
  "success": true,
  "message": "Orders fetched",
  "data": [
    {
      "id": "ord_123",
      "userId": "usr_1",
      "status": "PAID",
      "totalAmount": "599.00",
      "shippingAddress": {},
      "invoiceNumber": "INV-ABC12345",
      "createdAt": "2026-04-03T10:00:00.000Z",
      "updatedAt": "2026-04-03T10:30:00.000Z",
      "user": {
        "id": "usr_1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [],
      "payment": {
        "id": "pay_1",
        "provider": "MOCK",
        "status": "SUCCESS"
      }
    }
  ]
}
```

#### Errors

- `401` unauthorized

### GET `/api/orders/:id`

- Auth: Yes
- Description: Get one order by ID in requester scope.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

Returns full order with `user`, `items.book`, `payment`, and `qrCodes`.

#### Errors

- `400` validation failed
- `401` unauthorized
- `404` `"Order not found"`

### GET `/api/orders/:id/invoice`

- Auth: Yes
- Description: Generate invoice view for an order.
- Access rule: only order owner or admin.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Invoice generated",
  "data": {
    "invoiceNumber": "INV-ABCDEFGH",
    "orderId": "ord_123",
    "orderDate": "2026-04-03T10:00:00.000Z",
    "customer": {
      "id": "usr_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "PAID",
    "payment": {
      "provider": "RAZORPAY",
      "status": "SUCCESS",
      "transactionId": "pay_123"
    },
    "items": [
      {
        "bookTitle": "Book Name",
        "bookType": "EBOOK",
        "quantity": 1,
        "unitPrice": 299,
        "totalPrice": 299
      }
    ],
    "grandTotal": 299
  }
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `403` `"Not authorized to view invoice"`
- `404` `"Order not found"`

### POST `/api/orders/:orderId/pay`

- Auth: Yes
- Description: Initialize payment for an order.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `orderId` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "orderId": "ord_123",
    "provider": "RAZORPAY",
    "paymentId": "pay_rec_1",
    "providerPaymentId": "order_Rzp123",
    "clientSecret": null,
    "checkoutData": {
      "key": "rzp_test_...",
      "amount": 59900,
      "currency": "INR",
      "orderId": "order_Rzp123",
      "name": "Swapnaouran Prokashon",
      "description": "Payment for order ord_123"
    },
    "hint": "Open Razorpay checkout using checkoutData and then verify using razorpay_* fields"
  }
}
```

Possible `provider`-specific response:

- `RAZORPAY`: includes `checkoutData`
- `STRIPE`: includes `clientSecret`
- `MOCK`: hint tells you to verify with `confirmationCode=MOCK_SUCCESS`

#### Errors

- `400` `"Order already paid"`
- `400` validation failed
- `401` unauthorized
- `404` `"Order not found"`

### POST `/api/orders/:orderId/verify`

- Auth: Yes
- Description: Verify payment and finalize order.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `orderId` | string | Yes | non-empty |

#### Request body

All fields are optional at schema level, but provider-specific verification may require some.

| Field | Type | Used by |
| --- | --- | --- |
| `confirmationCode` | string | MOCK |
| `paymentIntentId` | string | STRIPE |
| `providerPaymentId` | string | not directly used in verification logic |
| `signature` | string | not directly used in verification logic |
| `razorpay_order_id` | string | RAZORPAY |
| `razorpay_payment_id` | string | RAZORPAY |
| `razorpay_signature` | string | RAZORPAY |
| `razorpayOrderId` | string | RAZORPAY (camelCase fallback) |
| `razorpayPaymentId` | string | RAZORPAY (camelCase fallback) |
| `razorpaySignature` | string | RAZORPAY (camelCase fallback) |

#### Provider verification rules

- MOCK: `confirmationCode` must be exactly `MOCK_SUCCESS`
- STRIPE: payment intent status must be `succeeded`
- RAZORPAY:
  - Requires order ID, payment ID, signature
  - Verifies HMAC signature
  - Order ID must match initialized provider order ID
  - If payment is fetched and status is not `captured` or `authorized`, verification fails

#### Success `200`

```json
{
  "success": true,
  "message": "Payment verified and order updated",
  "data": {
    "id": "ord_123",
    "status": "PAID",
    "payment": {
      "status": "SUCCESS"
    }
  }
}
```

Final response data contains the order object from `getOrderById` (includes `user`, `items.book`, `payment`, `qrCodes`).

#### Errors

- `400` `"Payment not initialized for this order"`
- `400` provider-specific reasons like:
  - `"Invalid mock confirmation code"`
  - `"paymentIntentId is required"`
  - `"Payment status is ..."`
  - `"razorpay_order_id, razorpay_payment_id and razorpay_signature are required"`
  - `"Razorpay order mismatch"`
  - `"Invalid Razorpay signature"`
- `400` validation failed
- `401` unauthorized
- `404` `"Order not found"`

## E-books

All `/api/ebooks/*` routes require authentication.

### GET `/api/ebooks/:id/read`

- Auth: Yes
- Description: Validate e-book access and return signed stream URL.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Access granted",
  "data": {
    "bookId": "book_1",
    "title": "E-book Title",
    "streamUrl": "http://localhost:5000/api/ebooks/book_1/stream?token=<signed_token>"
  }
}
```

#### Errors

- `400` `"This is not an e-book"`
- `400` validation failed
- `401` unauthorized
- `403` `"Access Denied"`
- `404` `"Book not found"`
- `404` `"E-book file is missing"`

### GET `/api/ebooks/:id/stream?token=...`

- Auth: Yes
- Description: Stream the e-book file inline (PDF or detected mime type).
- Output is binary stream, not wrapped in standard JSON success envelope.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Query parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `token` | string | Yes | signed file token from `/read` |

#### Stream response headers

- `Content-Type`: file mime type (often `application/pdf`)
- `Content-Disposition`: `inline; filename="<safe-title>.pdf"`
- `Content-Length`: set when available

#### Errors

- `400` validation failed
- `401` `"Invalid stream token"` or `"Stream token mismatch"`
- `401` unauthorized
- `403` `"Access Denied"`
- `404` `"E-book file not found"`

## Admin

All `/api/admin/*` routes require authenticated admin user.

### GET `/api/admin/users`

- Auth: Yes (`ADMIN`)
- Description: List users.

#### Success `200`

Returns array of users with fields:

- `id`, `name`, `email`, `role`, `createdAt`

#### Errors

- `401` unauthorized
- `403` admin required

### GET `/api/admin/books`

- Auth: Yes (`ADMIN`)
- Description: List all books (active and inactive).

#### Success `200`

Returns array of complete book rows.

#### Errors

- `401` unauthorized
- `403` admin required

### GET `/api/admin/orders`

- Auth: Yes (`ADMIN`)
- Description: List all orders with related user, items/book, and payment.

#### Success `200`

Returns array of orders including:

- `user`: `id`, `name`, `email`
- `items[].book`: `id`, `title`, `type`
- `payment`: full payment object

#### Errors

- `401` unauthorized
- `403` admin required

### GET `/api/admin/analytics`

- Auth: Yes (`ADMIN`)
- Description: Admin analytics summary from paid orders.

#### Success `200`

```json
{
  "success": true,
  "message": "Analytics fetched",
  "data": {
    "totalUsers": 10,
    "totalOrders": 25,
    "paidOrders": 18,
    "totalSales": 12450,
    "salesByBookType": {
      "ebook": {
        "units": 20,
        "revenue": 5600
      },
      "physical": {
        "units": 15,
        "revenue": 6850
      }
    }
  }
}
```

#### Errors

- `401` unauthorized
- `403` admin required

## Gallery

### GET `/api/gallery`

- Auth: No
- Description: Fetch gallery items.

#### Success `200`

Returns array of gallery rows:

- `id`, `title`, `imageUrl`, `publicId`, `uploadedById`, `createdAt`

### POST `/api/gallery`

- Auth: Yes (`ADMIN`)
- Description: Upload gallery image.
- Content type: `multipart/form-data`

#### Form fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `image` | file | Yes | must be image mime type, max 5MB |
| `title` | string | No | min 2, max 150 |

#### Success `201`

```json
{
  "success": true,
  "message": "Gallery image uploaded",
  "data": {
    "id": "gal_1",
    "title": "Event photo",
    "imageUrl": "https://...",
    "publicId": "book-platform/gallery/...",
    "uploadedById": "usr_admin",
    "createdAt": "2026-04-03T10:00:00.000Z"
  }
}
```

#### Errors

- `400` `"Image file is required"`
- `400` `"Only image files are allowed"`
- `400` `"File too large"`
- `400` validation failed
- `401` unauthorized
- `403` admin required

### DELETE `/api/gallery/:id`

- Auth: Yes (`ADMIN`)
- Description: Delete gallery item and attempt to delete stored file.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

```json
{
  "success": true,
  "message": "Gallery item deleted",
  "data": null
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `403` admin required
- `404` `"Gallery item not found"`

## QR

### GET `/api/qr/verify/:id`

- Auth: Yes
- Description: Verify QR entry by ID and track scan count/time.

#### Path parameters

| Param | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | Yes | non-empty |

#### Success `200`

Returns QR object including:

- QR fields: `id`, `userId`, `bookId`, `orderId`, `imageUrl`, `qrData`, `scannedCount`, `lastScannedAt`, `createdAt`
- joined `user`: `id`, `name`, `email`
- joined `book`: `id`, `title`, `type`
- joined `order`: `id`, `status`, `createdAt`

```json
{
  "success": true,
  "message": "QR verified",
  "data": {
    "id": "qr_1",
    "imageUrl": "https://...",
    "scannedCount": 3,
    "lastScannedAt": "2026-04-03T09:00:00.000Z",
    "user": {
      "id": "usr_1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "book": {
      "id": "book_1",
      "title": "Book Name",
      "type": "PHYSICAL"
    },
    "order": {
      "id": "ord_1",
      "status": "PAID",
      "createdAt": "2026-04-02T10:00:00.000Z"
    }
  }
}
```

#### Errors

- `400` validation failed
- `401` unauthorized
- `404` `"QR code not found"`

## 6. Payment Provider Selection Logic

Provider is resolved at runtime as:

1. `RAZORPAY` when `PAYMENT_PROVIDER=RAZORPAY` and both Razorpay keys are configured.
2. `STRIPE` when `PAYMENT_PROVIDER=STRIPE` and Stripe secret key is configured.
3. Otherwise fallback is `MOCK`.

## 7. Common Error Messages

- `401` `"Unauthorized"` when bearer token missing on protected endpoints.
- `401` `"Invalid token"` or `"Invalid or expired token"` when JWT check fails.
- `403` `"Admin access required"` when non-admin accesses admin route.
- `404` `"Route not found"` for unknown routes under this server.

## 8. Notes

- Decimal money fields from Prisma are serialized in JSON responses and may appear as strings.
- `DELETE /api/books/:id` is a soft delete (`isActive=false`).
- Successful payment verification automatically:
  - marks order as `PAID`
  - marks payment as `SUCCESS`
  - creates e-book access rows (for ebook items)
  - generates missing QR codes for paid order items
