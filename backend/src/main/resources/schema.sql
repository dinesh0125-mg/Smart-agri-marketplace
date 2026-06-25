-- ============================================================
-- SMART AGRICULTURE MARKETPLACE - MySQL Schema
-- Version: 1.0.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_agri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_agri_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name                       VARCHAR(100)    NOT NULL,
    email                           VARCHAR(150)    NOT NULL UNIQUE,
    phone                           VARCHAR(20),
    password                        VARCHAR(255)    NOT NULL,
    role                            ENUM('ADMIN','FARMER','BUYER') NOT NULL,
    profile_image                   TEXT,
    address                         TEXT,
    status                          ENUM('ACTIVE','BLOCKED','PENDING_VERIFICATION') DEFAULT 'PENDING_VERIFICATION',
    email_verified                  TINYINT(1)      DEFAULT 0,
    email_verification_token        VARCHAR(255),
    email_verification_token_expiry DATETIME,
    password_reset_token            VARCHAR(255),
    password_reset_token_expiry     DATETIME,
    created_at                      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role  (role),
    INDEX idx_users_status(status)
) ENGINE=InnoDB;

-- ── FARMERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    farm_name       VARCHAR(150),
    farm_location   VARCHAR(255),
    description     TEXT,
    experience      VARCHAR(100),
    specialty       VARCHAR(255),
    status          ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmers_status(status)
) ENGINE=InnoDB;

-- ── BUYERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buyers (
    buyer_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name   VARCHAR(100) NOT NULL UNIQUE,
    image           TEXT,
    emoji           VARCHAR(10),
    color           VARCHAR(20)
) ENGINE=InnoDB;

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id        BIGINT         NOT NULL,
    category_id      BIGINT,
    product_name     VARCHAR(150)   NOT NULL,
    description      TEXT,
    price            DECIMAL(10,2)  NOT NULL,
    stock            INT            DEFAULT 0,
    unit             VARCHAR(30),
    image            TEXT,
    organic_certified TINYINT(1)    DEFAULT 0,
    featured         TINYINT(1)     DEFAULT 0,
    discount         INT            DEFAULT 0,
    created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id)   REFERENCES farmers(farmer_id)   ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)       ON DELETE SET NULL,
    INDEX idx_products_farmer  (farmer_id),
    INDEX idx_products_category(category_id),
    INDEX idx_products_featured(featured),
    FULLTEXT idx_products_search(product_name, description)
) ENGINE=InnoDB;

-- ── CART ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id  BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (buyer_id) REFERENCES buyers(buyer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── CART_ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    quantity    INT    NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id)    REFERENCES cart(id)       ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)   ON DELETE CASCADE,
    UNIQUE KEY uq_cart_product (cart_id, product_id)
) ENGINE=InnoDB;

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id         BIGINT        NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    payment_status   ENUM('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
    order_status     ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED') DEFAULT 'PENDING',
    delivery_address TEXT,
    razorpay_order_id VARCHAR(100),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(buyer_id) ON DELETE CASCADE,
    INDEX idx_orders_buyer         (buyer_id),
    INDEX idx_orders_payment_status(payment_status),
    INDEX idx_orders_order_status  (order_status),
    INDEX idx_orders_razorpay      (razorpay_order_id)
) ENGINE=InnoDB;

-- ── ORDER_ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT        NOT NULL,
    product_id  BIGINT        NOT NULL,
    quantity    INT           NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_items_order  (order_id),
    INDEX idx_order_items_product(product_id)
) ENGINE=InnoDB;

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id             BIGINT        NOT NULL UNIQUE,
    razorpay_payment_id  VARCHAR(100),
    razorpay_order_id    VARCHAR(100),
    razorpay_signature   TEXT,
    amount               DECIMAL(10,2) NOT NULL,
    payment_status       ENUM('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payments_razorpay(razorpay_payment_id)
) ENGINE=InnoDB;

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id  BIGINT NOT NULL,
    buyer_id    BIGINT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id)   REFERENCES buyers(buyer_id) ON DELETE CASCADE,
    UNIQUE KEY uq_review (product_id, buyer_id),
    INDEX idx_reviews_product(product_id)
) ENGINE=InnoDB;

-- ── WISHLIST ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id    BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id)   REFERENCES buyers(buyer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)     ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist (buyer_id, product_id)
) ENGINE=InnoDB;

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    is_read     TINYINT(1)   DEFAULT 0,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user   (user_id),
    INDEX idx_notif_is_read(is_read)
) ENGINE=InnoDB;

-- ── CONTACT_MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     TINYINT(1)   DEFAULT 0,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── REFRESH_TOKENS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL UNIQUE,
    expiry_date DATETIME     NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── MARKET_PRICES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_prices (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    commodity_name  VARCHAR(100)  NOT NULL,
    emoji           VARCHAR(10),
    price           DECIMAL(10,2) NOT NULL,
    `change`        DECIMAL(5,2)  DEFAULT 0.00,
    unit            VARCHAR(50),
    updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── SEED: DEFAULT ADMIN ──────────────────────────────────────
-- Password: Admin@123 (BCrypt encoded)
INSERT IGNORE INTO users (full_name, email, phone, password, role, status, email_verified)
VALUES (
    'Admin',
    'admin@smartagri.in',
    '9999999999',
    '$2a$12$LcUt0QBTg7PvT3bJrQ8v4.jqpVXPwnijmKEw8E4bKpAnmUyiN5pbe',
    'ADMIN',
    'ACTIVE',
    1
);
