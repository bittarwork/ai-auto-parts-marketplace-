# Database Seed Guide

This document describes the comprehensive database seed script used to populate the platform with demo data for development and testing. The seed enables full exploration of all platform capabilities without leaving any features with empty data.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Running the Seed](#2-running-the-seed)
3. [Seed Contents Summary](#3-seed-contents-summary)
4. [User Accounts & Credentials](#4-user-accounts--credentials)
5. [Data Breakdown by Collection](#5-data-breakdown-by-collection)
6. [Relationships & Links](#6-relationships--links)
7. [Clearing Data](#7-clearing-data)

---

## 1. Overview

| Property | Value |
|---|---|
| **Script Location** | `backend/scripts/seed.js` |
| **npm Script** | `npm run seed` |
| **Dependencies** | MongoDB (via Mongoose), bcryptjs |
| **Behaviour** | Clears all existing data, then populates fresh demo data |

The seed script connects to the MongoDB instance defined in `MONGODB_URI` (from `.env`), removes all documents from the relevant collections, and inserts a complete set of interrelated demo data. All users share the same password per role for easy testing.

---

## 2. Running the Seed

### Prerequisites

- MongoDB running (local or remote)
- Backend dependencies installed (`npm install` in `backend/`)

### Command

```bash
cd backend
npm run seed
```

### Expected Output

```
✅ MongoDB Connected
🗑️  Clearing all existing data...
✅ All collections cleared
⚙️  Creating site settings...
✅ Settings created
👥 Creating users...
✅ Created 15 users
📁 Creating categories...
✅ Created 25 categories (8 main + 17 sub)
📦 Creating products...
✅ Created 44 products
🚗 Creating vehicles...
✅ Created 18 vehicles
🛒 Creating orders...
✅ Created 10 orders
🛍️  Creating carts...
✅ Created 6 carts
❤️  Creating wishlists...
✅ Created 10 wishlists
💬 Creating chat sessions...
✅ Created 5 chat sessions
🔔 Creating product notifications...
✅ Created 5 product notifications
🎉 Database seeding completed successfully!
```

---

## 3. Seed Contents Summary

| Collection | Count | Description |
|---|---|---|
| **Settings** | 1 | Site-wide configuration (currency EUR, shipping, tax, etc.) |
| **Users** | 15 | 1 Admin + 3 Suppliers + 11 Customers |
| **Categories** | 25 | 8 main categories + 17 subcategories (hierarchical) |
| **Products** | 44 | Parts across all categories with compatibility data |
| **Vehicles** | 18 | User-owned vehicles (all Chinese brands supported) |
| **Orders** | 10 | Orders covering all statuses and payment methods |
| **Carts** | 6 | Active shopping carts for customers |
| **Wishlists** | 10 | Product wishlists for customers |
| **ChatSessions** | 5 | AI chatbot conversation history |
| **ProductNotifications** | 5 | Back-in-stock notification subscriptions |

---

## 4. User Accounts & Credentials

### Administrator

| Field | Value |
|---|---|
| **Email** | `admin@autoparts.com` |
| **Password** | `Admin@2024!` |
| **Role** | `administrator` |

### Suppliers

| Email | Password | Business |
|---|---|---|
| `supplier1@autoparts.com` | `Supplier@2024!` | AutoParts Pro GmbH |
| `supplier2@autoparts.com` | `Supplier@2024!` | Chinese Motors Europe BV |
| `supplier3@autoparts.com` | `Supplier@2024!` | Elite Car Components Ltd |

### Customers

All customers use the password: **`Customer@2024!`**

| Email | Name |
|---|---|
| `ahmed@example.com` | Ahmed Al-Hassan |
| `fatima@example.com` | Fatima Khalil |
| `omar@example.com` | Omar Nasser |
| `layla@example.com` | Layla Ibrahim |
| `khalid@example.com` | Khalid Mansour |
| `sara@example.com` | Sara Al-Zahra |
| `mohammed@example.com` | Mohammed Al-Rashid |
| `nour@example.com` | Nour Haddad |
| `tariq@example.com` | Tariq Saleh |
| `rima@example.com` | Rima Barakat |
| `youssef@example.com` | Youssef Al-Khatib *(inactive user)* |

---

## 5. Data Breakdown by Collection

### Settings

- **Currency**: EUR  
- **Default Language**: en  
- **Shipping Flat Rate**: €12  
- **Free Shipping Threshold**: €150  
- **Tax Rate**: 19%  
- **Low Stock Threshold**: 8 units  

### Categories (Main)

| Slug | Name (EN) | Name (AR) |
|---|---|---|
| `engine-parts` | Engine Parts | قطع المحرك |
| `brake-system` | Brake System | نظام الفرامل |
| `suspension` | Suspension & Steering | التعليق والتوجيه |
| `electrical` | Electrical System | النظام الكهربائي |
| `body-parts` | Body & Exterior | الهيكل والخارج |
| `filters` | Filters | الفلاتر |
| `transmission` | Transmission | ناقل الحركة |
| `cooling-system` | Cooling System | نظام التبريد |

Subcategories (17) include: Timing Components, Brake Pads, Shock Absorbers, Lighting, Oil Filters, Cabin Air Filter, etc.

### Products

- **44 products** across all categories  
- **10 featured products**  
- **1 out-of-stock** product (ABS Wheel Speed Sensor) for testing back-in-stock notifications  
- Each product includes:
  - Bilingual name/description (EN/AR)
  - Part number (unique)
  - Compatibility data (brand, model, year range, engine type, transmission)
  - Specifications, images, warranty, ratings
  - Search keywords for AI/NLP search
- Supported vehicle brands: Chery, Geely, MG, Haval, Great Wall, Changan, BYD

### Vehicles

- **18 vehicles** distributed across customers  
- Examples: Chery Tiggo 7 Pro, Geely Coolray, Haval H6, MG ZS, BYD Atto 3, Great Wall Wingle 7, etc.  
- Includes engine type, transmission, mileage, and primary vehicle flag  

### Orders

- **10 orders** with various states:
  - **delivered**: 3  
  - **shipped**: 1  
  - **processing**: 2  
  - **confirmed**: 1  
  - **cancelled**: 1  
  - **pending**: 2  
- Payment methods: card, cash_on_delivery, bank_transfer  
- Payment statuses: paid, pending, failed, refunded  

### Carts

- **6 active carts** with multiple items each  
- Covers different customers for cart-related testing  

### Wishlists

- **10 wishlists** (one per customer)  
- Each contains 2–5 products  

### Chat Sessions

- **5 chat sessions** with realistic AI conversation flow  
- Topics: brake pads for Tiggo 7 Pro, oil change for Coolray, suspension noise for H6, MG ZS parts inquiry, timing belt replacement  
- Includes both authenticated and guest sessions  

### Product Notifications

- **5 subscriptions** for out-of-stock product  
- Used to test back-in-stock notification feature  

---

## 6. Relationships & Links

The seed maintains referential integrity across collections:

- **Products** → `category` (Category), `supplier` (User)  
- **Products** → `compatibility` (brand, model, year ranges)  
- **Vehicles** → `user` (User)  
- **Orders** → `customer` (User), `items[].product` (Product)  
- **Carts** → `user` (User), `items[].product` (Product)  
- **Wishlists** → `user` (User), `products` (Product)  
- **ChatSessions** → `user` (User, optional for guests)  
- **ProductNotifications** → `product` (Product), `user` (User)  

---

## 7. Clearing Data

The seed script **always clears** all data before inserting. There is no incremental or append mode. Each run results in a completely fresh database state.

To manually clear data without re-seeding, you would need to run MongoDB commands or use a custom script. The project's `package.json` may include:

```bash
npm run seed:clear   # If implemented — check backend/package.json
```

---

## Related Documentation

- **[Admin Console Guide](ADMIN_GUIDE.md)** — Admin features and workflows  
- **[User Interface Guide](USER_GUIDE.md)** — Customer-facing features  
- **README.md** — Project overview and setup  
