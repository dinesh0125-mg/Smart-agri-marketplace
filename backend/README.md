# 🌱 Smart Agriculture Marketplace — Backend API

Production-ready Spring Boot 3 backend with JWT auth, Razorpay payments, Cloudinary image upload, email notifications, and full role-based access control.

---

## ⚙️ Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Language     | Java 21                           |
| Framework    | Spring Boot 3.2.5                 |
| Security     | Spring Security + JWT (jjwt 0.12) |
| ORM          | Spring Data JPA / Hibernate       |
| Database     | MySQL 8                           |
| Images       | Cloudinary                        |
| Payments     | Razorpay                          |
| Email        | Spring Mail (Gmail SMTP)          |
| Docs         | Swagger / SpringDoc OpenAPI 3     |
| Build        | Maven                             |

---

## 🚀 Quick Start

### 1 — Prerequisites
- Java 21
- MySQL 8
- Maven 3.8+
- Cloudinary account (free tier OK)
- Razorpay account (test mode)
- Gmail account with App Password

### 2 — Clone & Configure

```bash
git clone https://github.com/your-org/smart-agri-backend.git
cd smart-agri-backend
```

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/smart_agri_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Cloudinary
cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_API_KEY
cloudinary.api-secret=YOUR_API_SECRET

# Razorpay
razorpay.key-id=rzp_test_XXXXXXXX
razorpay.key-secret=YOUR_RAZORPAY_SECRET

# Email
spring.mail.username=your.email@gmail.com
spring.mail.password=YOUR_APP_PASSWORD   # Gmail App Password (not your login password)
app.mail.from=noreply@smartagri.in
app.frontend-url=http://localhost:5173
```

### 3 — Run

```bash
mvn clean install -DskipTests
mvn spring-boot:run
```

Server starts at: `http://localhost:8080/api`  
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### 4 — Default Admin Account
```
Email:    admin@smartagri.in
Password: Admin@123
```

---

## 📡 Complete API Reference

### Base URL: `/api`

All responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00"
}
```

---

### 🔐 Authentication (`/auth`)

| Method | Endpoint                   | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/auth/register`          | ❌   | Register FARMER / BUYER  |
| POST   | `/auth/login`             | ❌   | Login → get JWT tokens   |
| POST   | `/auth/refresh-token`     | ❌   | Refresh access token     |
| POST   | `/auth/logout`            | ✅   | Invalidate refresh token |
| POST   | `/auth/forgot-password`   | ❌   | Send password reset email|
| POST   | `/auth/reset-password`    | ❌   | Reset with token         |
| POST   | `/auth/change-password`   | ✅   | Change current password  |
| GET    | `/auth/verify-email`      | ❌   | Verify email with token  |
| GET    | `/auth/me`                | ✅   | Get current user         |

**Register body (BUYER):**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Pass@1234",
  "phone": "9876543210",
  "role": "BUYER"
}
```

**Register body (FARMER):**
```json
{
  "fullName": "Ramesh Kumar",
  "email": "ramesh@farm.com",
  "password": "Pass@1234",
  "phone": "9876500001",
  "role": "FARMER",
  "farmName": "Green Valley Farm",
  "farmLocation": "Pune, Maharashtra",
  "description": "Organic farm since 2010",
  "experience": "14 years",
  "specialty": "Vegetables, Fruits"
}
```

**Login response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "uuid-refresh-token",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "fullName": "Admin",
    "email": "admin@smartagri.in",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

---

### 🛍️ Products (`/products`)

| Method | Endpoint               | Auth            | Description                |
|--------|----------------------|-----------------|----------------------------|
| GET    | `/products`          | ❌              | List/search products       |
| GET    | `/products/{id}`     | ❌              | Product detail             |
| GET    | `/products/featured` | ❌              | Featured products          |
| POST   | `/products`          | FARMER / ADMIN  | Create product (multipart) |
| PUT    | `/products/{id}`     | FARMER / ADMIN  | Update product (multipart) |
| DELETE | `/products/{id}`     | FARMER / ADMIN  | Delete product             |

**Query params for GET `/products`:**
```
page=0&size=12&query=tomato&categoryId=1
&minPrice=10&maxPrice=500&organic=true
&sortBy=price&direction=asc
```

**Create product (multipart/form-data):**
```
Part "product" (application/json):
{
  "productName": "Fresh Tomatoes",
  "description": "Freshly harvested from our organic farm",
  "price": 45.00,
  "stock": 100,
  "unit": "kg",
  "categoryId": 1,
  "organicCertified": true,
  "featured": false,
  "discount": 0
}
Part "image": <file>
```

---

### 📂 Categories (`/categories`)

| Method | Endpoint            | Auth  | Description     |
|--------|-------------------|-------|-----------------|
| GET    | `/categories`     | ❌    | All categories  |
| GET    | `/categories/{id}`| ❌    | Category detail |
| POST   | `/categories`     | ADMIN | Create category |
| PUT    | `/categories/{id}`| ADMIN | Update category |
| DELETE | `/categories/{id}`| ADMIN | Delete category |

---

### 🌾 Farmers

**Public:**

| Method | Endpoint                            | Auth | Description         |
|--------|-----------------------------------|------|---------------------|
| GET    | `/farmers/public`                 | ❌   | All farmers         |
| GET    | `/farmers/public/{id}`            | ❌   | Farmer profile      |
| GET    | `/farmers/public/{id}/products`   | ❌   | Farmer's products   |

**Farmer-only (`/farmer`):**

| Method | Endpoint                          | Auth   | Description          |
|--------|----------------------------------|--------|----------------------|
| GET    | `/farmer/dashboard`              | FARMER | Farmer dashboard     |
| GET    | `/farmer/profile`                | FARMER | My profile           |
| GET    | `/farmer/products`               | FARMER | My products          |
| GET    | `/farmer/orders`                 | FARMER | Orders for my items  |
| PATCH  | `/farmer/orders/{id}/status`     | FARMER | Update order status  |
| GET    | `/farmer/notifications`          | FARMER | My notifications     |

---

### 🛒 Cart (`/buyer/cart`) — BUYER only

| Method | Endpoint                        | Description         |
|--------|-------------------------------|---------------------|
| GET    | `/buyer/cart`                 | Get cart            |
| POST   | `/buyer/cart/add`             | Add item            |
| PUT    | `/buyer/cart/items/{id}`      | Update quantity     |
| DELETE | `/buyer/cart/items/{id}`      | Remove item         |
| DELETE | `/buyer/cart/clear`           | Clear cart          |

---

### 📦 Orders (`/buyer/orders`) — BUYER only

| Method | Endpoint                       | Description          |
|--------|------------------------------|----------------------|
| POST   | `/buyer/orders`              | Place order from cart|
| GET    | `/buyer/orders`              | My order history     |
| GET    | `/buyer/orders/{id}`         | Order details        |
| PATCH  | `/buyer/orders/{id}/cancel`  | Cancel order         |

---

### 💳 Payments (`/buyer/payments`) — BUYER only

| Method | Endpoint                              | Description                    |
|--------|-------------------------------------|--------------------------------|
| POST   | `/buyer/payments/create-order/{id}` | Create Razorpay order          |
| POST   | `/buyer/payments/verify`            | Verify payment signature       |
| POST   | `/buyer/payments/failure`           | Record payment failure         |

**Razorpay payment flow:**
1. Buyer places order → `POST /buyer/orders` → gets `orderId`
2. Create Razorpay order → `POST /buyer/payments/create-order/{orderId}` → gets `razorpayOrderId`, `keyId`, `amount`
3. Frontend opens Razorpay checkout widget
4. On success → `POST /buyer/payments/verify` with the 3 Razorpay IDs
5. On failure → `POST /buyer/payments/failure?razorpayOrderId=...`

---

### ❤️ Wishlist (`/buyer/wishlist`) — BUYER only

| Method | Endpoint                      | Description      |
|--------|---------------------------- |------------------|
| GET    | `/buyer/wishlist`            | My wishlist      |
| POST   | `/buyer/wishlist/{productId}`| Add to wishlist  |
| DELETE | `/buyer/wishlist/{productId}`| Remove           |
| GET    | `/buyer/wishlist/{id}/check` | Check if added   |

---

### ⭐ Reviews

| Method | Endpoint                              | Auth  | Description    |
|--------|-------------------------------------|-------|----------------|
| GET    | `/products/{id}/reviews`            | ❌    | Product reviews|
| POST   | `/buyer/products/{id}/reviews`      | BUYER | Add review     |
| PUT    | `/buyer/reviews/{id}`               | BUYER | Edit review    |
| DELETE | `/buyer/reviews/{id}`               | BUYER | Delete review  |

---

### 🔔 Notifications (`/notifications`) — All roles

| Method | Endpoint                       | Description          |
|--------|------------------------------|----------------------|
| GET    | `/notifications`             | All my notifications |
| GET    | `/notifications/unread-count`| Unread count         |
| PATCH  | `/notifications/{id}/read`   | Mark one as read     |
| PATCH  | `/notifications/read-all`    | Mark all as read     |

---

### 👑 Admin Panel (`/admin`) — ADMIN only

| Method | Endpoint                          | Description              |
|--------|----------------------------------|--------------------------|
| GET    | `/admin/dashboard`               | Dashboard stats          |
| GET    | `/admin/users`                   | All users                |
| PATCH  | `/admin/users/{id}/block`        | Block user               |
| PATCH  | `/admin/users/{id}/activate`     | Activate user            |
| DELETE | `/admin/users/{id}`              | Delete user              |
| GET    | `/admin/farmers`                 | All farmers              |
| GET    | `/admin/farmers/pending`         | Pending approvals        |
| PATCH  | `/admin/farmers/{id}/approve`    | Approve farmer           |
| PATCH  | `/admin/farmers/{id}/reject`     | Reject farmer            |
| GET    | `/admin/products`                | All products             |
| DELETE | `/admin/products/{id}`           | Delete product           |
| GET    | `/admin/orders`                  | All orders               |
| GET    | `/admin/orders/{id}`             | Order detail             |
| PATCH  | `/admin/orders/{id}/status`      | Update order status      |
| GET    | `/admin/contact-messages`        | Contact messages         |

---

### 📈 Market Prices (`/market-prices`)

| Method | Endpoint              | Auth  | Description   |
|--------|--------------------- |-------|---------------|
| GET    | `/market-prices`     | ❌    | All prices    |
| POST   | `/market-prices`     | ADMIN | Create price  |
| PUT    | `/market-prices/{id}`| ADMIN | Update price  |
| DELETE | `/market-prices/{id}`| ADMIN | Delete price  |

---

## 🗃️ Database Structure

```
users ──┬── farmers ── products ──┬── cart_items ── cart ── buyers
        │                         ├── order_items ── orders ── buyers
        └── buyers ──┬── cart     ├── reviews
                     ├── orders   └── wishlist
                     └── wishlist
```

---

## 📧 Email Templates

| Trigger             | Subject                            |
|---------------------|-----------------------------------|
| Register            | Welcome to Smart Agriculture       |
| Email verification  | Verify your account                |
| Forgot password     | Reset your password                |
| Order placed        | Order #ORD-{id} Confirmed          |
| Payment success     | Payment received for Order #{id}   |
| Order status update | Order #{id} is now {STATUS}        |
| Farmer approved     | Your farmer account is approved!   |
| Farmer rejected     | Account Review Update              |

---

## 🔒 Security

- JWT access token: 24 hours  
- Refresh token: 7 days (stored in DB, revocable)  
- Passwords: BCrypt strength 12  
- CORS: configured for `localhost:5173` and production domains  
- Method-level security: `@PreAuthorize` on all protected routes  

---

## 📘 Swagger UI

Interactive API docs available at:
```
http://localhost:8080/api/swagger-ui.html
```

Click "Authorize" → paste your Bearer token to test protected endpoints.

---

## 📮 Postman Collection

Import `src/main/resources/SmartAgri-Postman-Collection.json` into Postman.

The collection auto-captures `accessToken` and `refreshToken` on login.

---

## 🏗️ Project Structure

```
src/main/java/com/smartagri/
├── SmartAgriApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CloudinaryConfig.java
│   ├── SwaggerConfig.java
│   ├── AppConfig.java
│   └── DataInitializer.java
├── controller/
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── CategoryController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── PaymentController.java
│   ├── ReviewController.java
│   ├── WishlistController.java
│   ├── FarmerController.java
│   ├── UserController.java
│   ├── AdminController.java
│   ├── NotificationController.java
│   ├── MarketPriceController.java
│   └── ContactController.java
├── dto/
│   ├── request/  (LoginRequest, RegisterRequest, ...)
│   └── response/ (ApiResponse, AuthResponse, ProductResponse, ...)
├── entity/
│   ├── User.java
│   ├── Farmer.java
│   ├── Buyer.java
│   ├── Category.java
│   ├── Product.java
│   ├── Cart.java / CartItem.java
│   ├── Order.java / OrderItem.java
│   ├── Payment.java
│   ├── Review.java
│   ├── Wishlist.java
│   ├── Notification.java
│   ├── ContactMessage.java
│   ├── RefreshToken.java
│   └── MarketPrice.java
├── enums/
│   ├── Role.java
│   ├── UserStatus.java
│   ├── OrderStatus.java
│   ├── PaymentStatus.java
│   └── FarmerStatus.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   ├── UnauthorizedException.java
│   └── DuplicateResourceException.java
├── repository/
│   ├── UserRepository.java
│   ├── FarmerRepository.java
│   ├── BuyerRepository.java
│   ├── ProductRepository.java
│   ├── CategoryRepository.java
│   ├── CartRepository.java / CartItemRepository.java
│   ├── OrderRepository.java
│   ├── PaymentRepository.java
│   ├── ReviewRepository.java
│   ├── WishlistRepository.java
│   ├── NotificationRepository.java
│   ├── ContactMessageRepository.java
│   ├── RefreshTokenRepository.java
│   └── MarketPriceRepository.java
├── security/
│   ├── UserDetailsServiceImpl.java
│   └── jwt/
│       ├── JwtUtil.java
│       └── JwtAuthFilter.java
└── service/
    ├── AuthService.java
    ├── UserService.java
    ├── FarmerService.java
    ├── ProductService.java
    ├── CategoryService.java
    ├── CartService.java
    ├── OrderService.java
    ├── PaymentService.java
    ├── ReviewService.java
    ├── WishlistService.java
    ├── AdminService.java
    ├── NotificationService.java
    ├── ContactService.java
    ├── MarketPriceService.java
    ├── EmailService.java
    └── CloudinaryService.java
```
