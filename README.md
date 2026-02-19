# Chinese Auto Parts — AI-Powered E-Commerce Platform

<div align="center">

**An intelligent marketplace for Chinese vehicle spare parts**  
*Built for a Saudi Arabian automotive company*

---

> **IMPORTANT NOTICE**
>
> This repository is a **portfolio demo project** developed and owned exclusively by the author.
> It is **NOT production-ready** and is shared solely for professional showcase purposes.
> Please read the [Usage & Licensing](#usage--licensing) section carefully before proceeding.

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Target Client](#2-target-client)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [Architecture Overview](#5-architecture-overview)
6. [Application Structure](#6-application-structure)
7. [Core Modules — Frontend](#7-core-modules--frontend)
8. [Core Modules — Backend](#8-core-modules--backend)
9. [Data Models](#9-data-models)
10. [API Routes Reference](#10-api-routes-reference)
11. [AI & Intelligence Layer](#11-ai--intelligence-layer)
12. [Admin Console](#12-admin-console)
13. [User-Facing Storefront](#13-user-facing-storefront)
14. [Running the Project Locally](#14-running-the-project-locally)
15. [Environment Variables](#15-environment-variables)
16. [Production Readiness Status](#16-production-readiness-status)
17. [Usage & Licensing](#17-usage--licensing)
18. [About the Author](#18-about-the-author)

---

## 1. Project Overview

**Chinese Auto Parts** is a full-stack, AI-powered e-commerce platform specialising in spare parts for Chinese-manufactured vehicles. The platform was designed and developed as a custom solution targeting the Saudi Arabian automotive market, where Chinese car brands — such as Chery, Geely, MG, Haval, Great Wall, Changan, and BYD — have seen rapid and significant market penetration in recent years.

The platform distinguishes itself from standard e-commerce solutions by deeply integrating artificial intelligence throughout the entire shopping journey: from natural-language search queries, to automatic vehicle-to-part compatibility matching, to a context-aware conversational chatbot assistant powered by OpenAI.

### Platform Highlights

| Aspect | Detail |
|---|---|
| **Type** | Full-Stack E-Commerce Web Application |
| **Target Market** | Saudi Arabian Automotive Sector |
| **Supported Brands** | Chery, Geely, MG, Haval, Great Wall, Changan, BYD |
| **Currency** | Euro (€) |
| **Language** | English (with Arabic support framework) |
| **AI Integration** | OpenAI GPT — Search NLP, Chatbot, Recommendations |
| **Authentication** | JWT-based token authentication |
| **Status** | Portfolio Demo — Not Production-Ready |

---

## 2. Target Client

This platform was designed and developed specifically for a **Saudi Arabian company** operating in the Chinese vehicle spare parts sector. The business context is as follows:

- The Saudi market has experienced exponential growth in Chinese vehicle registrations, creating strong demand for a reliable, intelligent parts sourcing platform.
- The client required a modern, bilingual-ready (English/Arabic) storefront with full catalogue management, order fulfilment, and supplier oversight capabilities.
- The AI layer was specifically requested to solve the core customer pain point: buyers of Chinese vehicles often do not know the exact technical part number they need, making natural language search and AI compatibility matching critical differentiators.
- The admin console was designed to support a small operations team managing the full order lifecycle from a single back-office interface.

> This project remains in portfolio demonstration status and has not been deployed for the client in a production environment.

---

## 3. Key Features

### AI-Powered Capabilities
- **Natural Language Search (NLP)** — Customers can describe parts in plain English (e.g., *"oil filter for Chery Tiggo 2020"*) and the AI engine extracts structured entities: part type, vehicle brand, model, and year — then returns relevant results with a confidence score.
- **Voice Search** — Microphone-based input converts spoken queries to text in real time.
- **AI Chatbot Assistant** — A persistent floating chat widget, powered by OpenAI GPT, that answers product questions, guides users through compatibility checks, provides policy information, and recommends products. Context-aware: the chatbot knows which product page the user is viewing.
- **Vehicle Compatibility Engine** — Users register their vehicles; the platform automatically cross-references every product's compatibility matrix to inform the customer whether a part fits their car.
- **AI Recommendations** — Personalised product suggestions based on browsing history, registered vehicles, and purchase patterns. "Frequently Bought Together" suggestions on product pages. Trending products surface automatically.

### E-Commerce Core
- Full product catalogue with bilingual names (English/Arabic), part numbers, brands, conditions (New/Used/Refurbished), pricing, stock management, and image galleries.
- Hierarchical category system (unlimited depth) for structured product taxonomy.
- Supplier management with an approval workflow — suppliers register with business licence details and require administrator approval before going live.
- Shopping cart with guest session support — no account required to browse and add to cart.
- Two-step checkout process (Shipping → Payment) with saved address support and four payment methods.
- Complete order lifecycle management: Pending → Confirmed → Processing → Shipped → Delivered, with carrier tracking integration (DHL, FedEx, UPS, Aramex).
- Wishlist with real-time sync across the header badge.
- Back-in-stock notification subscription for out-of-stock products.

### Admin Console
- Real-time KPI dashboard with revenue charts, order status distribution, low-stock alerts, and top-selling products.
- Full order fulfilment workspace with timeline history, tracking details, status and payment controls, and admin notes.
- Bulk product operations (activate/deactivate multiple products simultaneously).
- User management with role assignment (Customer / Supplier / Administrator) and account status control.
- Category tree editor with expandable hierarchy, depth badges, and product count indicators.
- Analytics reporting with period selection (Daily/Weekly/Monthly), revenue/orders dual-axis charts, donut charts by status, user growth line chart, and top-10 products table.
- AI chatbot analytics: session counts, daily usage chart, and recent sessions audit.
- System settings: site name, currency, language, shipping rates, free shipping threshold, tax rate, and notification thresholds.

### UX & Design
- Fully responsive design across Mobile, Tablet, and Desktop breakpoints.
- Light Mode and Dark Mode with system preference detection and persistent manual override.
- Colour-coded status badges, stock level indicators, and overdue order warnings throughout.
- Interactive address map picker with reverse geocoding (Leaflet + OpenStreetMap).
- Print-formatted invoice generation from the order detail page.

---

## 4. Technology Stack

### Frontend

| Layer | Technology | Version |
|---|---|---|
| **UI Framework** | React | 18.2 |
| **Build Tool** | Vite | 4.4 |
| **Routing** | React Router DOM | 6.16 |
| **State Management** | Redux Toolkit + React Redux | 1.9 / 8.1 |
| **Styling** | Tailwind CSS | 3.4 |
| **Component Library** | Headless UI + Heroicons | 1.7 / 2.0 |
| **Forms** | React Hook Form | 7.47 |
| **HTTP Client** | Axios | 1.5 |
| **Charts** | Recharts | 3.7 |
| **Maps** | Leaflet + React-Leaflet | 1.9 / 4.2 |
| **Notifications** | React Hot Toast | 2.6 |
| **Internationalisation** | i18next + react-i18next | 23.5 / 13.2 |

### Backend

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | ≥ 18.0 |
| **Framework** | Express.js | 4.18 |
| **Database** | MongoDB (via Mongoose) | 7.5 |
| **Caching** | Redis (via ioredis) | 5.3 |
| **Authentication** | JSON Web Tokens (jsonwebtoken) | 9.0 |
| **Password Hashing** | bcryptjs | 2.4 |
| **AI / LLM** | OpenAI SDK | 4.20 |
| **Validation** | express-validator | 7.0 |
| **Rate Limiting** | express-rate-limit | 6.10 |
| **Security Headers** | Helmet | 7.0 |
| **File Uploads** | Multer | 1.4 |
| **Logging** | Morgan | 1.10 |

---

## 5. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Storefront  │  │ Admin Console│  │   AI Chatbot      │  │
│  │  (Customer)  │  │  /admin/*    │  │  (Floating Widget)│  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│         │                  │                   │             │
│  ┌──────┴──────────────────┴───────────────────┴──────────┐  │
│  │         Redux Store + React Context                     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / Axios
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Routes Layer                    │   │
│  │  /auth  /products  /orders  /cart  /ai  /admin  ...  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│  ┌─────────────┐  ┌─────┴──────────┐  ┌──────────────────┐  │
│  │  Middleware │  │  Controllers   │  │    Services       │  │
│  │  (JWT, Rate │  │  (Route Logic) │  │  (AI, Business)   │  │
│  │   Limit...) │  └─────┬──────────┘  └──────────────────┘  │
│  └─────────────┘        │                                    │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌───────────┐ ┌──────────────┐
   │   MongoDB   │ │   Redis   │ │  OpenAI API  │
   │  (Primary   │ │  (Cache & │ │  (GPT NLP +  │
   │  Database)  │ │  Sessions)│ │   Chatbot)   │
   └─────────────┘ └───────────┘ └──────────────┘
```

The application follows a clean separation-of-concerns architecture:
- **Frontend** is a Single Page Application (SPA) served statically, communicating with the backend exclusively via REST API calls.
- **Backend** is a RESTful API server with structured middleware, controller, and service layers.
- **MongoDB** serves as the primary persistent data store for all application data.
- **Redis** provides caching for frequently accessed data (products, categories) and session management.
- **OpenAI API** powers the NLP search engine, AI chatbot responses, and recommendation logic.

---

## 6. Application Structure

```
ai-auto-parts-marketplace/
│
├── frontend/                        # React SPA
│   └── src/
│       ├── pages/                   # Route-level page components
│       │   ├── admin/               # Admin console pages
│       │   ├── HomePage.jsx
│       │   ├── SearchResultsPage.jsx
│       │   ├── ProductDetailsPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrdersPage.jsx
│       │   ├── OrderDetailPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── VehiclesPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── WishlistPage.jsx
│       │   └── ...
│       ├── components/              # Reusable UI components
│       ├── services/                # Axios API service modules
│       ├── contexts/                # React Context providers
│       ├── hooks/                   # Custom React hooks
│       ├── i18n/                    # Internationalisation (EN/AR)
│       ├── utils/                   # Utility functions
│       └── App.jsx                  # Root router and layout
│
├── backend/                         # Express.js REST API
│   └── src/
│       ├── server.js                # Application entry point
│       ├── config/                  # Database, Redis, environment config
│       ├── models/                  # Mongoose data models
│       ├── controllers/             # Route handler logic
│       ├── routes/                  # Express route definitions
│       ├── middleware/              # Auth, validation, rate limiting
│       └── services/               # AI, email, and business services
│
└── Documentation/
    ├── USER_GUIDE.md               # End-user interface documentation
    └── ADMIN_GUIDE.md              # Administrator console documentation
```

---

## 7. Core Modules — Frontend

### Storefront Pages

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Hero with AI search, brands, trending & popular products, CTA |
| **Search Results** | `/search?q=` | NLP-enhanced results with AI Understanding card, filters, and sorting |
| **All Products** | `/products` | Full catalogue with filtering and pagination |
| **Categories** | `/categories` | Hierarchical category browser |
| **Product Details** | `/products/:id` | Gallery, specs, compatibility check, chatbot context, recommendations |
| **Shopping Cart** | `/cart` | Item management, quantity controls, order summary with shipping calculator |
| **Checkout** | `/checkout` | Two-step: Shipping (saved addresses + map picker) → Payment |
| **Dashboard** | `/dashboard` | Account hub with navigation cards, AI recommendations, recent orders |
| **Profile** | `/profile` | Personal info, password management, saved addresses with map |
| **Vehicles** | `/vehicles` | Vehicle registration and compatible parts lookup |
| **Orders** | `/orders` | Full order history table |
| **Order Detail** | `/orders/:id` | Progress stepper, tracking card, items, status history, cancel option |
| **Wishlist** | `/wishlist` | Saved products with direct add-to-cart |
| **Login / Register** | `/login`, `/register` | JWT authentication flows |
| **Password Reset** | `/forgot-password`, `/reset-password` | Account recovery |
| **About / FAQ / Support** | `/about`, `/faq`, `/support`, ... | Informational and policy pages |

### Admin Pages

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/admin` | KPI cards, revenue chart, order status chart, low stock, top products |
| **Orders** | `/admin/orders` | Searchable, filterable, sortable order list with overdue alerts |
| **Order Detail** | `/admin/orders/:id` | Full fulfilment workspace with tracking, timeline, and notes |
| **Products** | `/admin/products` | Catalogue management with bulk operations |
| **Product Form** | `/admin/products/new`, `/admin/products/:id/edit` | Bilingual form with specs and compatibility matrix |
| **Users** | `/admin/users` | User directory with role/status management |
| **User Detail** | `/admin/users/:id` | Full user profile, role editor, order history |
| **Categories** | `/admin/categories` | Tree/list view with full CRUD |
| **Suppliers** | `/admin/suppliers` | Supplier approval and suspension workflow |
| **Analytics** | `/admin/analytics` | Revenue, orders, and user growth charts with period selector |
| **AI Analytics** | `/admin/ai` | Chatbot session statistics and recent session audit |
| **Settings** | `/admin/settings` | Platform configuration: general, shipping, tax, notifications |

---

## 8. Core Modules — Backend

### Middleware Stack

| Middleware | Purpose |
|---|---|
| **Helmet** | Sets secure HTTP response headers |
| **CORS** | Configures cross-origin resource sharing for the frontend origin |
| **Morgan** | HTTP request logging |
| **Compression** | Gzip response compression |
| **express-rate-limit** | Rate limiting on all API endpoints to prevent abuse |
| **JWT Auth Middleware** | Validates Bearer tokens; attaches decoded user to the request object |
| **Admin Guard** | Verifies the `administrator` role; rejects non-admin requests to admin routes |

### Services Layer

| Service | Responsibilities |
|---|---|
| **AI Service** | NLP query parsing, OpenAI GPT chatbot responses, product recommendation logic |
| **Seed Script** | Database population with realistic demo data for all models |

---

## 9. Data Models

### User
Fields: `name`, `email`, `password` (bcrypt hashed), `phone`, `role` (customer / supplier / administrator), `isActive`, `addresses[]`, `supplierInfo` (businessName, licence, taxNumber), timestamps.

### Product
Fields: `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `partNumber`, `brand`, `condition` (new/used/refurbished), `price`, `originalPrice`, `stock`, `category` (ref), `images[]`, `specifications[]` (key/value pairs), `compatibility[]` (brand/model/yearFrom/yearTo), `isActive`, `isFeatured`, `ratings`, `reviewCount`, timestamps.

### Order
Fields: `orderNumber`, `user` (ref), `items[]` (product ref, quantity, price), `shippingAddress`, `paymentMethod`, `paymentStatus`, `status` (pending/confirmed/processing/shipped/delivered/cancelled), `statusHistory[]` (status, note, timestamp), `trackingInfo` (carrier, number, estimatedDelivery), `subtotal`, `shippingCost`, `tax`, `discount`, `total`, `adminNotes`, timestamps.

### Category
Fields: `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `parent` (self-ref), `isActive`, `level`, `slug`, timestamps.

### Vehicle
Fields: `user` (ref), `brand`, `model`, `year`, `engineType`, `transmission`, `mileage`, `nickname`, `vin`, `notes`, `isPrimary`, timestamps.

### Cart
Fields: `user` (ref), `items[]` (product ref, quantity, price snapshot), timestamps.

### GuestCart
Fields: `sessionId`, `items[]`, `expiresAt`, timestamps.

### ChatSession
Fields: `user` (ref or null for guests), `messages[]` (role, content, timestamp, products[]), `sessionTitle`, timestamps.

### Settings
Fields: `siteName`, `contactEmail`, `currency`, `defaultLanguage`, `flatShippingRate`, `freeShippingThreshold`, `taxRate`, `lowStockThreshold`, `notifications` (newOrder, lowStock), timestamps.

### Wishlist
Fields: `user` (ref), `products[]` (product ref), timestamps.

### ProductNotification
Fields: `user` (ref), `product` (ref), `notified`, timestamps.

---

## 10. API Routes Reference

| Route Group | Base Path | Endpoints |
|---|---|---|
| **Authentication** | `/api/auth` | Register, Login, Forgot Password, Reset Password, Get Current User |
| **Products** | `/api/products` | CRUD, search with NLP, featured products, compatibility lookup |
| **Categories** | `/api/categories` | CRUD, tree structure, products by category |
| **Orders** | `/api/orders` | Create order, user order list, order detail, cancel order |
| **Cart** | `/api/cart` | Get cart, add item, update quantity, remove item, clear cart, guest cart sync |
| **Vehicles** | `/api/vehicles` | CRUD, set primary, compatible parts lookup |
| **Wishlist** | `/api/wishlist` | Get wishlist, add product, remove product |
| **AI** | `/api/ai` | NLP search parse, chatbot message, recommendations, chat history, AI analytics |
| **Admin** | `/api/admin` | Dashboard KPIs, order management, user management, supplier management, settings |

---

## 11. AI & Intelligence Layer

The AI layer is the platform's primary technical differentiator. It is built around the **OpenAI GPT API** and operates across four distinct functional areas:

### 11.1 Natural Language Search (NLP)
When a user submits a search query, the backend AI service sends the query to the OpenAI API with a structured system prompt instructing it to extract:
- **Part type** (e.g., oil filter, brake pads, headlight assembly)
- **Vehicle brand** (e.g., Chery, Haval)
- **Vehicle model** (e.g., Tiggo 7, Jolion)
- **Model year** (e.g., 2020, 2022)
- **Confidence score** (0–100%)

The extracted entities are then used to build a structured MongoDB query with weighted relevance scoring. The frontend displays the parsed entities as colour-coded badges in the "AI Understanding of Your Search" card above the results, providing transparency into how the query was interpreted.

### 11.2 AI Chatbot Assistant
The chatbot operates as a persistent floating widget on all pages. It maintains conversation history within a session and sends the full message thread to OpenAI GPT on each turn, allowing contextual, multi-turn conversations.

When the user is on a Product Details page, the product's data (name, part number, compatibility list, specs) is injected into the system prompt as context, enabling the chatbot to answer specific questions about that exact product without the user needing to provide additional information.

For authenticated users, conversation sessions are automatically persisted to MongoDB and retrievable from the chat history panel.

### 11.3 Product Recommendations
The recommendation engine generates personalised suggestions by sending the user's vehicle profile (brands, models, years), recent browsing activity, and purchase history to the AI service, which returns ranked product IDs from the catalogue.

### 11.4 Frequently Bought Together
On product detail pages, the AI service analyses co-purchase patterns from the order history and returns a set of products commonly purchased alongside the current item.

---

## 12. Admin Console

The Admin Console is a fully independent interface accessible at `/admin`, protected by a dual-layer guard (authentication + administrator role check). It uses a dedicated dark-sidebar layout entirely separate from the storefront.

For complete documentation of all admin screens, features, and workflows, refer to:

**[Admin Console Interface Guide](Documentation/ADMIN_GUIDE.md)**

### Access
- URL: `http://localhost:5173/admin`
- Requirement: Valid JWT token with `administrator` role
- Non-authenticated users: redirected to `/login`
- Authenticated non-admins: redirected to `/`

---

## 13. User-Facing Storefront

The customer storefront covers the complete shopping journey from discovery to post-purchase tracking, with AI assistance at every step.

For complete documentation of all customer-facing screens, features, and user flows, refer to:

**[User Interface Guide](Documentation/USER_GUIDE.md)**

### Guest vs Authenticated Capabilities

| Feature | Guest | Authenticated |
|---|---|---|
| Browse Products | ✅ | ✅ |
| AI Search & Chatbot | ✅ | ✅ |
| Add to Cart | ✅ | ✅ |
| Checkout | ❌ (redirect to login) | ✅ |
| Wishlist | ❌ | ✅ |
| Vehicles & Compatibility | ❌ | ✅ |
| Order History | ❌ | ✅ |
| AI Personalised Recs | ❌ | ✅ |
| Chat History | ❌ | ✅ |

---

## 14. Running the Project Locally

> This section is provided for **demonstration and evaluation purposes only**.
> Running this project requires environment credentials that are not included in this repository.

### Prerequisites
- Node.js ≥ 18.0
- npm ≥ 9.0
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install
# Configure your .env file (see Section 15)
npm run seed        # Optional: seed the database with demo data
npm run dev         # Start the backend development server
```

The backend server starts on `http://localhost:5000` by default.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev         # Start the frontend development server (Vite)
```

The frontend development server starts on `http://localhost:5173` by default.

### Demo Admin Account
After running the seed script, a default administrator account is created. Credentials are defined in the seed script (`backend/scripts/seed.js`).

---

## 15. Environment Variables

The backend requires a `.env` file in the `backend/` directory. A `.env` file is **not included** in this repository for security reasons.

The following variables are required:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chinese-auto-parts

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 16. Production Readiness Status

> **This project is explicitly NOT ready for production deployment.**

It is a portfolio-grade demonstration build. The following areas would require significant work before any live deployment could be considered:

| Area | Current Status | Required for Production |
|---|---|---|
| **Security Audit** | Basic implementation | Full penetration testing and security hardening |
| **Authentication** | JWT with basic validation | Refresh tokens, 2FA, session revocation |
| **Payment Processing** | Placeholder methods (COD, Card, Transfer) | Real payment gateway integration (e.g., HyperPay, Moyasar for KSA) |
| **Email Service** | Not implemented | Transactional email provider (SendGrid, Postmark) |
| **Image Storage** | Local file references | Cloud object storage (AWS S3, Cloudinary) |
| **HTTPS / SSL** | Not configured | TLS certificate and HTTPS enforcement |
| **Error Monitoring** | Console logging only | Sentry or equivalent error tracking |
| **Load Testing** | Not performed | Stress testing and performance benchmarking |
| **CI/CD Pipeline** | Not configured | Automated build, test, and deployment pipeline |
| **Data Backup** | Not configured | Automated database backup strategy |
| **Compliance** | Not assessed | PDPL (Saudi data protection law) compliance review |
| **Localisation** | Arabic framework present | Full Arabic translation and RTL layout completion |
| **Testing Coverage** | Minimal | Comprehensive unit, integration, and E2E tests |

---

## 17. Usage & Licensing

```
Copyright (c) 2026 — All Rights Reserved
```

This project and all its source code, design, architecture, and documentation are the **exclusive intellectual property of the author**.

### What Is Permitted

- **Viewing** the code and documentation for educational or evaluation purposes.
- **Running** the project locally on your own machine strictly for personal evaluation, after contacting and receiving explicit permission from the author.
- **Demonstrating** the project to others as part of reviewing the author's portfolio work.

### What Is Strictly Prohibited

- **Copying**, reproducing, or extracting any portion of the code for use in any other project — personal, commercial, or open-source — without prior written consent from the author.
- **Redistribution** of the code or any derivative work in any form.
- **Commercial use** of any part of this codebase, design, or architecture.
- **Forking** this repository for the purpose of building upon or extending the project without explicit written agreement from the author.
- **Claiming** any part of this work as your own.

Any use of this code beyond passive viewing — including cloning for local execution — requires direct communication with and written approval from the author.

> **Violation of these terms may constitute copyright infringement under applicable law.**

---

## 18. About the Author

This project was independently designed, architected, and developed as a showcase of full-stack development capabilities including:

- **Full-Stack Web Development** — Complete frontend (React/Vite) and backend (Node.js/Express) implementation from scratch.
- **AI Integration** — Production-grade integration with the OpenAI API for NLP, conversational AI, and recommendation systems.
- **E-Commerce Architecture** — Cart, checkout, order lifecycle, supplier management, and admin console design.
- **UI/UX Design** — Responsive, accessible, and dual-theme interface design using Tailwind CSS.
- **Database Design** — Relational-style document modelling in MongoDB with cross-referenced schemas.

### Contact & Permissions

For portfolio enquiries, collaboration proposals, or to request permission for any use of this codebase beyond passive viewing, please reach out via the contact information on my profile.

> **Do not use, copy, or distribute any part of this work without explicit written permission.**

---

<div align="center">

*Chinese Auto Parts — AI-Powered E-Commerce Platform*  
*Portfolio Demo Project — February 2026*  
*© 2026 All Rights Reserved*

</div>
