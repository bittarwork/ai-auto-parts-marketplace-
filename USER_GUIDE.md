# Chinese Auto Parts — Complete User Interface Guide

**Platform Name:** Chinese Auto Parts  
**Version:** 1.0  
**Document Type:** End-User Interface Documentation  
**Language:** English  
**Date:** February 2026  

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Global Navigation & Header](#2-global-navigation--header)
3. [Home Page](#3-home-page)
4. [AI-Powered Search](#4-ai-powered-search)
5. [Search Results Page](#5-search-results-page)
6. [All Products Page](#6-all-products-page)
7. [Categories Page](#7-categories-page)
8. [Product Details Page](#8-product-details-page)
9. [Shopping Cart](#9-shopping-cart)
10. [Checkout Process](#10-checkout-process)
11. [User Authentication](#11-user-authentication)
12. [User Dashboard](#12-user-dashboard)
13. [Profile Management](#13-profile-management)
14. [My Vehicles](#14-my-vehicles)
15. [Orders & Order Tracking](#15-orders--order-tracking)
16. [Wishlist](#16-wishlist)
17. [AI Chatbot Assistant](#17-ai-chatbot-assistant)
18. [Footer & Informational Pages](#18-footer--informational-pages)
19. [Theme & Appearance](#19-theme--appearance)
20. [Required Screenshots Index](#20-required-screenshots-index)

---

## 1. Platform Overview

**Chinese Auto Parts** is an intelligent e-commerce platform specialising in auto parts for Chinese-manufactured vehicles. The platform is designed to simplify the experience of finding compatible spare parts by integrating artificial intelligence at every stage of the shopping journey — from the initial search query to the final order placement.

The platform serves customers who own Chinese vehicles from brands including **Chery**, **Geely**, **MG**, **Haval**, **Great Wall**, **Changan**, and **BYD**. Rather than requiring customers to know the exact technical part number, the system accepts natural-language queries and intelligently interprets the customer's intent.

### Key Characteristics

| Feature | Description |
|---|---|
| **Currency** | Euro (€) |
| **Language** | English |
| **Supported Brands** | Chery, Geely, MG, Haval, Great Wall, Changan, BYD |
| **AI Search** | Natural language processing for parts discovery |
| **Compatibility Engine** | Automatic vehicle-to-part matching |
| **Guest Shopping** | Cart accessible without account |
| **Account Required** | Checkout, Wishlist, Orders, Vehicles |

---

## 2. Global Navigation & Header

The header is permanently fixed at the top of every page across the platform, ensuring that core navigation remains accessible regardless of how far a user has scrolled down any given page.

> 📸 **[SCREENSHOT REQUIRED — SS-001]**  
> *Full-width header in Light Mode, desktop view, showing logo, navigation links, and all action icons.*

> 📸 **[SCREENSHOT REQUIRED — SS-002]**  
> *Full-width header in Dark Mode, desktop view.*

### 2.1 Logo & Brand Identity

On the left side of the header, the platform displays its logo — a stylised "CA" emblem rendered within a gradient-coloured square icon, accompanied by the text **"Chinese Auto Parts"** and the tagline **"Smart Auto Parts"**. Clicking the logo from any page navigates the user immediately back to the Home Page.

### 2.2 Main Navigation Links

The desktop navigation bar, positioned at the centre of the header, presents four primary navigation destinations:

- **Home** — Returns to the main landing page.
- **Products** — Opens the full product catalogue listing.
- **Categories** — Displays a structured hierarchy of part categories.
- **About Us** — Presents the company background and mission statement.

On mobile devices, these links are collapsed into a hamburger menu (three horizontal lines) that expands into a slide-up panel when tapped.

### 2.3 Action Icons (Right Side)

The right portion of the header contains a set of interactive icons providing quick access to key features:

#### Search Icon (Mobile Only)
A magnifying glass icon appearing exclusively on mobile viewports, allowing users to initiate a search without navigating away from the current page.

#### Dark/Light Mode Toggle
A sun icon (☀) or moon icon (☽) that switches the interface between **Light Mode** and **Dark Mode**. The system respects the user's operating system preference by default and persists the chosen setting for future visits.

#### Wishlist Icon
A heart icon (♡) navigates to the user's saved wishlist. When the user is logged in and has items saved, a small red numeric badge appears on the icon indicating the count of saved products.

#### Shopping Cart Icon
A cart icon navigates to the Shopping Cart page. A blue numeric badge on the icon reflects the current number of items in the cart. The cart is accessible even without logging in, as it supports guest sessions.

#### Account / User Icon
- **When not logged in:** A user silhouette icon navigates to the Login page.
- **When logged in:** The icon is accompanied by a small downward arrow (chevron). Clicking it opens a dropdown panel with the following options:
  - **My Dashboard** — Account overview and recent activity.
  - **My Profile** — Personal information management.
  - **My Orders** — Full purchase history.
  - **My Vehicles** — Vehicle registration for AI compatibility.
  - **Wishlist** — Saved favourite products.
  - **Logout** — Triggers a confirmation dialogue before signing out.

> 📸 **[SCREENSHOT REQUIRED — SS-003]**  
> *Account dropdown menu open, showing all navigation options.*

### 2.4 Mobile Navigation Menu

On small screens, tapping the hamburger icon reveals a full mobile menu panel with all navigation links and account options. Authenticated users see additional account links (Dashboard, Profile, Orders, Vehicles, Wishlist, Logout), while unauthenticated users see Login and Register links.

> 📸 **[SCREENSHOT REQUIRED — SS-004]**  
> *Mobile navigation menu expanded, showing all links (authenticated state).*

### 2.5 Logout Confirmation

When a user initiates logout — either from the desktop dropdown or the mobile menu — a modal dialogue appears requesting confirmation before proceeding. This prevents accidental sign-outs. The dialogue presents two options: **Logout** (confirms the action) and **Cancel** (dismisses the dialogue).

---

## 3. Home Page

The Home Page serves as the primary entry point to the platform. It is structured as a vertically scrolling landing page with several distinct sections, each serving a specific purpose in guiding the user toward finding the right product.

**URL:** `/`

> 📸 **[SCREENSHOT REQUIRED — SS-005]**  
> *Full Home Page above the fold — Hero section with search bar, in Light Mode.*

> 📸 **[SCREENSHOT REQUIRED — SS-006]**  
> *Full Home Page above the fold — Hero section in Dark Mode.*

### 3.1 Hero Section

The hero section occupies the upper portion of the page with a rich gradient background in deep blue tones. It contains:

- **Platform Badge:** A small label reading "AI-Powered Platform" with a sparkle icon, visually indicating the platform's core differentiator.
- **Primary Headline:** "Find the Perfect Auto Parts with AI Intelligence" — communicating the platform's value proposition.
- **Sub-headline:** A descriptive sentence explaining that the search understands natural language.
- **Intelligent Search Bar:** The central interactive element of the hero section. This is the primary AI search input (described in detail in Section 4).
- **Popular Searches:** A set of quick-access pill-shaped buttons displaying common search terms — *brake pads*, *oil filter*, *headlight*, *spark plugs*. Clicking any of these instantly executes a pre-defined search query.

> 📸 **[SCREENSHOT REQUIRED — SS-007]**  
> *Close-up of the hero section's popular search pills.*

### 3.2 Why Choose Us Section

Immediately below the hero, four feature cards present the platform's key advantages in a responsive grid layout:

| Feature | Icon | Description |
|---|---|---|
| **AI-Powered Search** | ✨ Sparkles | Natural language understanding for effortless searching |
| **Compatibility Check** | 🛡 Shield | Automatic verification that parts match the customer's vehicle |
| **Instant Results** | ⚡ Bolt | Millisecond-fast results with intelligent ranking |
| **24/7 AI Support** | 💬 Chat | Always-available intelligent chatbot assistance |

> 📸 **[SCREENSHOT REQUIRED — SS-008]**  
> *"Why Choose Us" section with four feature cards.*

### 3.3 Supported Brands Section

A grid of brand cards displays all supported Chinese automotive brands. Each brand card is clickable and immediately triggers a search query for that brand's parts. The supported brands are: **Chery, Geely, MG, Haval, Great Wall, Changan, BYD**.

> 📸 **[SCREENSHOT REQUIRED — SS-009]**  
> *Supported brands grid section.*

### 3.4 Trending Products Section

This section — displayed only when trending product data is available — showcases up to four products currently experiencing elevated purchase activity, as identified by the AI recommendation engine. A "View All" button on the right navigates to the full product catalogue.

> 📸 **[SCREENSHOT REQUIRED — SS-010]**  
> *Trending Products section with product cards.*

### 3.5 Popular Products Section

A larger grid of up to eight products sorted by overall popularity and customer demand. Like the trending section, a "View All" button links to the complete catalogue.

### 3.6 Personalised Recommendations

For authenticated users, a dedicated section appears below the popular products, displaying AI-generated personal recommendations based on the user's browsing history, saved vehicles, and purchase patterns.

### 3.7 Call-to-Action Banner

The page concludes with a full-width gradient banner encouraging visitors to begin searching or create an account. Two prominent action buttons are presented:

- **Start Searching** — Navigates directly to the search page.
- **Create Account** — Navigates to the registration page.

---

## 4. AI-Powered Search

The Intelligent Search Bar is the platform's most distinctive feature, present on both the Home Page (as a prominent hero element) and the Search Results Page (as a persistent refinement tool). It accepts queries written in natural, conversational English rather than requiring precise technical terminology.

> 📸 **[SCREENSHOT REQUIRED — SS-011]**  
> *Intelligent Search Bar in the hero section, with example placeholder text visible.*

> 📸 **[SCREENSHOT REQUIRED — SS-012]**  
> *Search bar with active suggestions dropdown visible.*

### 4.1 Natural Language Input

Users may type queries in plain English, describing what they need in their own words. The system is designed to interpret the underlying intent even when exact part names are unknown. Example queries:

- *"oil filter for Chery Tiggo 2020"*
- *"I need brake pads for Haval Jolion"*
- *"headlight replacement for Geely Emgrand"*

The AI engine analyses such queries to extract structured information including the **part type**, **vehicle brand**, **vehicle model**, and **model year**.

### 4.2 Voice Search

The search bar includes a microphone icon enabling voice-based input. Upon activation, the browser requests microphone permission and converts spoken words into text within the search field. If the user's browser does not support voice input, a notification is displayed informing the user accordingly.

> 📸 **[SCREENSHOT REQUIRED — SS-013]**  
> *Search bar showing the microphone icon for voice search.*

### 4.3 Real-Time Suggestions

As the user types, a dropdown panel appears beneath the search field displaying:

- **Search Suggestions:** AI-generated completions and related query suggestions based on the current input.
- **Popular Searches:** Globally common search terms across the platform.
- **Recent Searches:** Previously executed queries stored locally on the user's device.

Clicking any suggestion immediately executes the corresponding search.

### 4.4 Search Execution

Pressing the **Enter** key or clicking the search button submits the query and navigates the user to the Search Results Page, where AI-processed results are displayed.

---

## 5. Search Results Page

The Search Results Page displays products matching a user's query, enhanced by the platform's Natural Language Processing (NLP) engine. It is a dynamically updated page that responds to changes in the search query, applied filters, and sorting preferences.

**URL:** `/search?q={query}`

> 📸 **[SCREENSHOT REQUIRED — SS-014]**  
> *Search Results Page — full view with NLP analysis card, filters, and product grid.*

### 5.1 AI Understanding Card (NLP Analysis)

When the AI engine successfully interprets the user's query with sufficient confidence (above 30% confidence threshold), a highlighted card appears at the top of the results, titled **"AI Understanding of Your Search"**. This card displays the extracted search entities as colour-coded badges, such as:

- **Part:** *oil filter*
- **Brand:** *Chery*
- **Model:** *Tiggo*
- **Year:** *2020*
- **Confidence:** *85%*

This transparency feature helps users verify that the system correctly understood their intent, and builds trust in the results presented.

> 📸 **[SCREENSHOT REQUIRED — SS-015]**  
> *NLP Analysis card showing extracted entities and confidence score.*

### 5.2 Related Searches

Below the NLP card, a row of related search suggestions appears, generated by the AI based on the current query. These allow users to quickly pivot to adjacent searches without retyping. Each suggestion is a clickable pill button.

### 5.3 Search Filters Panel

A collapsible filters panel is positioned above the product grid, allowing customers to narrow results by:

- **Brand** — Filter by vehicle manufacturer.
- **Price Range** — Set minimum and maximum price boundaries.
- **In Stock Only** — Show only products currently available for immediate purchase.
- **Rating** — Filter by minimum customer rating.

A **Clear Filters** button resets all active filters simultaneously.

> 📸 **[SCREENSHOT REQUIRED — SS-016]**  
> *Search filters panel expanded with active filters applied.*

### 5.4 Sort Options

A dropdown selector positioned at the top-right of the results area allows ordering results by:

- **Most Relevant** (default) — AI-determined relevance to the query.
- **Price: Low to High** — Ascending price order.
- **Price: High to Low** — Descending price order.
- **Highest Rated** — Products with the best customer ratings first.
- **Most Popular** — Ordered by purchase frequency.
- **Newest** — Most recently added products first.

### 5.5 Results Summary

A line of text beneath the page title indicates the total number of products found and, when available, the time the search took (e.g., *"Found 47 products in 112ms"*). This reinforces the platform's speed and efficiency.

### 5.6 Product Grid

Search results are displayed in a responsive grid of product cards (described in detail in Section 8). Each card shows the product image, name, price, stock status, and compatibility indicator if the user has a registered vehicle.

### 5.7 Pagination

When results exceed 20 products per page, a pagination control appears at the bottom. Users may navigate between pages using numbered buttons or Previous/Next arrows. The page automatically scrolls to the top upon page navigation.

> 📸 **[SCREENSHOT REQUIRED — SS-017]**  
> *Pagination controls at the bottom of search results.*

### 5.8 Empty Search State

If a user arrives on the search page without a query, a welcoming prompt encourages them to begin typing, with an example query shown as guidance.

---

## 6. All Products Page

**URL:** `/products`

The All Products Page presents the complete catalogue of available parts in a browsable grid format. It is accessible from the header navigation under "Products" and from various "View All" links across the platform.

> 📸 **[SCREENSHOT REQUIRED — SS-018]**  
> *All Products Page — full grid view with filtering and sorting options.*

The page supports the same filtering and sorting capabilities as the Search Results Page, allowing customers to organise the catalogue by brand, price, availability, rating, and recency. Pagination is applied when the catalogue exceeds a single page of results.

---

## 7. Categories Page

**URL:** `/categories`

The Categories Page presents all available part categories in a hierarchical, visually organised layout. Customers who prefer to browse by part type rather than search can use this page to navigate to specific areas of the catalogue — for example, **Engine Parts**, **Brakes**, **Suspension**, **Electrical Systems**, or **Body Parts**.

> 📸 **[SCREENSHOT REQUIRED — SS-019]**  
> *Categories Page showing all category cards in a grid layout.*

Clicking a category card navigates the user to a filtered product listing showing only parts belonging to that category.

---

## 8. Product Details Page

The Product Details Page provides an exhaustive view of a single product, encompassing all information a customer requires to make an informed purchasing decision.

**URL:** `/products/{product-id}`

> 📸 **[SCREENSHOT REQUIRED — SS-020]**  
> *Product Details Page — full view in Light Mode, showing image gallery, price, and action buttons.*

> 📸 **[SCREENSHOT REQUIRED — SS-021]**  
> *Product Details Page — full view in Dark Mode.*

### 8.1 Breadcrumb Navigation

At the top of the page, a breadcrumb trail shows the user their navigation path (e.g., *Home > Products > Brake Pad Set*), allowing them to return to any prior level with a single click.

### 8.2 Product Image Gallery

The primary product image is displayed in a large square frame on the left side. When a product has multiple images, thumbnail previews are displayed in a row beneath the main image. Clicking a thumbnail updates the main display image. This interactive gallery allows customers to examine the product from different angles.

> 📸 **[SCREENSHOT REQUIRED — SS-022]**  
> *Product image gallery with thumbnail row visible.*

### 8.3 Product Information Panel

To the right of the image gallery (or beneath it on mobile), the following details are presented:

#### Featured Badge
If the product has been designated as featured, a prominent yellow badge labelled "Featured" appears above the product name.

#### Product Title & Wishlist Toggle
The product name is displayed in large, bold typography. On the right side of the title row, a heart icon (♡) serves as the wishlist toggle:
- **Unfilled heart** — Product is not currently saved.
- **Filled red heart** — Product has been saved to the wishlist.

Clicking the heart icon while not logged in redirects the user to the login page, with an automatic redirect back to the product upon successful authentication.

#### Part Number
Below the product title, the unique part number is displayed in a monospaced font, preceded by the label "Part No:".

#### Customer Rating
If the product has received reviews, a five-star rating display shows the average score with filled stars corresponding to the rating value. The numerical score and total review count are shown adjacent to the stars.

#### Price
The product price is displayed in large, bold typography in Euro (€), followed by the notation "+ VAT" indicating that applicable value-added tax is applied separately.

### 8.4 Stock Status

A clearly labelled stock indicator shows one of three states:

- **✅ In Stock (X available)** — Green text with a checkmark, showing the exact quantity available.
- **❌ Out of Stock** — Red text with an X icon.
- **⚠ Low Stock** — Warning state when stock levels are low.

### 8.5 Quantity Selector

When the product is in stock, a quantity input control is displayed with minus (−) and plus (+) buttons. The quantity cannot be reduced below 1, and cannot be increased beyond the available stock quantity. The user may also type a quantity directly into the input field.

### 8.6 Purchase Action Buttons

Two full-width action buttons are presented when a product is in stock:

- **Add to Cart** (primary, blue) — Adds the selected quantity to the shopping cart and displays a success notification. The cart icon in the header updates its badge count.
- **Buy Now** (outlined) — Adds the product to the cart and immediately navigates to the cart page, accelerating the purchase flow.

When a product is out of stock, these buttons are replaced by a single:

- **Notify Me When In Stock** (bell icon) — When clicked by an authenticated user, subscribes them to a back-in-stock notification. The button text changes to *"You'll be notified when in stock"* upon successful subscription. Unauthenticated users are redirected to log in first.

> 📸 **[SCREENSHOT REQUIRED — SS-023]**  
> *Product action buttons for an in-stock product (Add to Cart + Buy Now).*

> 📸 **[SCREENSHOT REQUIRED — SS-024]**  
> *"Notify Me When In Stock" button for an out-of-stock product.*

### 8.7 Service Guarantees

Below the action buttons, two service guarantee badges are displayed:

- **🚚 Free Shipping over €500** — Indicates the minimum order value qualifying for free delivery.
- **🛡 X Month Warranty** — Displays the specific warranty period applicable to the product.

### 8.8 Compatibility Check

Below the main product information grid, a dedicated compatibility section appears. If the user has registered vehicles in their account, the AI engine automatically evaluates whether the current product is compatible with each of their vehicles and displays the result clearly.

> 📸 **[SCREENSHOT REQUIRED — SS-025]**  
> *Compatibility badge showing "Compatible with [Vehicle Name]".*

### 8.9 Product Details Tab

A card section below the compatibility check presents:

- **Description** — A full written description of the product and its function.
- **Specifications** — A two-column grid listing technical specifications as key-value pairs (e.g., Material: Steel, Dimensions: 120mm × 45mm).
- **Compatibility List** — A collection of badge tags listing all vehicle makes, models, and year ranges the part is confirmed compatible with (e.g., *Chery Tiggo 2018-2022*).

> 📸 **[SCREENSHOT REQUIRED — SS-026]**  
> *Product Details section showing description, specifications, and compatibility tags.*

### 8.10 Frequently Bought Together

An AI-powered section below the product details suggests products commonly purchased alongside the current item. This helps customers assemble complete part sets in a single shopping session, reducing return visits.

> 📸 **[SCREENSHOT REQUIRED — SS-027]**  
> *"Frequently Bought Together" section with suggested companion products.*

### 8.11 Similar Products

At the bottom of the page, a grid of up to six similar products is presented, sourced from the AI recommendation engine based on category, brand compatibility, and product attributes.

---

## 9. Shopping Cart

The Shopping Cart page provides a complete review of all items selected for purchase prior to proceeding to checkout.

**URL:** `/cart`

> 📸 **[SCREENSHOT REQUIRED — SS-028]**  
> *Shopping Cart page — full view with items and order summary sidebar.*

> 📸 **[SCREENSHOT REQUIRED — SS-029]**  
> *Empty cart state with "Browse Products" button.*

### 9.1 Cart Header

The page title "Shopping Cart" is accompanied by a subtitle indicating the total number of items currently in the cart. If the user is not logged in, an advisory note is displayed: *"Login required to complete purchase."*

### 9.2 Cart Item Cards

Each product in the cart is displayed as a card containing:

- **Product Image** — A thumbnail linking to the product's detail page.
- **Product Name** — A clickable link to the full product page.
- **Part Number** — Displayed in monospaced text for identification.
- **Unit Price** — The price per individual unit. If the price has changed since the item was added, the original price is shown struck-through.
- **Stock Warning** — If the requested quantity exceeds current stock, a red warning message is shown.
- **Quantity Controls** — Minus (−) and plus (+) buttons with a numeric input field. Changes are reflected immediately in the cart totals.
- **Item Total** — The calculated total for that line (unit price × quantity).
- **Remove Button** — A trash icon button that triggers a confirmation dialogue before removing the item.

> 📸 **[SCREENSHOT REQUIRED — SS-030]**  
> *Individual cart item card showing all elements including quantity controls.*

### 9.3 Clear Cart

A "Clear Cart" button beneath the item list triggers a confirmation dialogue allowing users to remove all items simultaneously.

### 9.4 Order Summary Sidebar

The right column (or bottom section on mobile) contains a sticky order summary panel showing:

| Line Item | Value |
|---|---|
| **Subtotal** | Sum of all item totals |
| **Shipping** | €50 flat rate, or FREE when subtotal ≥ €500 |
| **Tax (15%)** | Calculated on the subtotal |
| **Total** | Grand total including all charges |

When the subtotal is below €500, a helpful message appears indicating how much more is needed to qualify for free shipping (e.g., *"Add €120 more for free shipping"*).

### 9.5 Trust Badges

Three assurance icons appear at the bottom of the summary panel: **Secure Payment**, **Easy Returns**, and **Warranty Included**.

### 9.6 Checkout & Continue Shopping

- **Proceed to Checkout** — Primary action button. If the user is not logged in, clicking this navigates to the login page, after which the user is automatically redirected to the checkout page.
- **Continue Shopping** — Secondary button returning the user to the product catalogue.

---

## 10. Checkout Process

The Checkout Page guides the user through a structured two-step process to complete their order. This page requires authentication; unauthenticated users are redirected to log in.

**URL:** `/checkout`

> 📸 **[SCREENSHOT REQUIRED — SS-031]**  
> *Checkout Page — Step 1: Shipping Information, showing saved addresses and form.*

### 10.1 Progress Indicator

A visual step tracker at the top of the page shows two steps:

1. **Shipping** — Collection of delivery address details.
2. **Payment** — Selection of payment method.

The currently active step is highlighted in blue. Completed steps display a checkmark icon.

### 10.2 Step 1 — Shipping Information

#### Saved Addresses

If the user has previously saved delivery addresses in their profile, these are displayed as selectable radio-button cards. Each card shows the address label (Home, Work, etc.) and a preview of the street and city. A "Default" badge highlights the user's pre-designated default address. Users may select any saved address with a single click.

An additional option — **"Enter a new address"** — appears at the bottom of the saved addresses list, allowing users to input a fresh address for this order.

#### Address Form Fields

When entering a new address (or for users without saved addresses), the following fields are presented:

| Field | Required | Notes |
|---|---|---|
| Full Name | ✅ | Recipient's full name |
| Phone Number | ✅ | Contact number for delivery |
| Email Address | ✅ | Order confirmation recipient |
| Address Line 1 | ✅ | Street address |
| Address Line 2 | ✗ | Apartment, floor, additional details |
| City | ✅ | Delivery city |
| State / Province | ✗ | Optional regional detail |
| Postal Code | ✅ | Required for delivery routing |
| Country | ✅ | Pre-filled; editable |

#### Continue to Payment

Clicking this button validates all required fields. Validation errors are displayed inline beneath each problematic field. Upon successful validation, the user advances to Step 2.

> 📸 **[SCREENSHOT REQUIRED — SS-032]**  
> *Checkout Step 1 — address form with validation error messages visible.*

### 10.3 Step 2 — Payment Method

#### Payment Options

Four payment methods are presented as selectable radio-button cards:

| Method | Description |
|---|---|
| **Cash on Delivery** | Payment upon receipt of the order |
| **Credit Card** | Secure card payment |
| **Debit Card** | Direct bank card payment |
| **Bank Transfer** | Direct bank account transfer |

The selected method is highlighted with a blue border.

> 📸 **[SCREENSHOT REQUIRED — SS-033]**  
> *Checkout Step 2 — Payment method selection with Cash on Delivery selected.*

#### Order Notes

An optional text area below the payment methods allows customers to provide special instructions for their order (e.g., preferred delivery times, access codes, or handling notes).

#### Back & Place Order

- **Back to Shipping** — Returns to Step 1 without losing entered information.
- **Place Order** (primary, with shield icon) — Validates the cart, validates stock availability, and creates the order. Upon success, a confirmation notification appears and the user is redirected to the order detail page.

### 10.4 Order Summary Sidebar

Throughout both steps, a persistent sidebar displays a condensed view of the cart contents (scrollable if many items), along with the full price breakdown (Subtotal, Shipping, Tax, Total).

---

## 11. User Authentication

### 11.1 Registration Page

**URL:** `/register`

New users may create an account by providing their full name, email address, and a password. Passwords must meet a minimum security threshold.

> 📸 **[SCREENSHOT REQUIRED — SS-034]**  
> *Registration page — full form view.*

### 11.2 Login Page

**URL:** `/login`

Existing users log in using their registered email and password. The login page also provides a link to the **Forgot Password** flow for account recovery.

When redirected to the login page from a protected feature (e.g., wishlist, checkout), the user is automatically returned to the original destination after successful authentication.

> 📸 **[SCREENSHOT REQUIRED — SS-035]**  
> *Login page with email and password fields.*

### 11.3 Forgot Password

**URL:** `/forgot-password`

Users who cannot access their account may request a password reset by entering their registered email address. The system dispatches a reset link to that address.

### 11.4 Reset Password

**URL:** `/reset-password`

Upon following the reset link received by email, users are presented with a form to enter and confirm a new password.

---

## 12. User Dashboard

**URL:** `/dashboard`  
**Access:** Authenticated users only

The Dashboard serves as the central hub of the user's account, providing a consolidated overview of all account areas with quick-access navigation cards.

> 📸 **[SCREENSHOT REQUIRED — SS-036]**  
> *User Dashboard — full view showing quick-access cards and recent orders table.*

### 12.1 Welcome Banner

The page opens with a personalised greeting: *"Welcome back, [User Name]"*, immediately establishing a personalised context for the session.

### 12.2 Quick-Access Navigation Cards

Four large, clickable navigation cards are displayed in a responsive grid:

| Card | Icon | Destination |
|---|---|---|
| **Profile** | 👤 Blue | Personal information and address management |
| **Orders** | 🛍 Blue | Complete order history |
| **Wishlist** | ❤ Red | Saved favourite products |
| **Vehicles** | 🚗 Green | Registered vehicles for AI compatibility |

Each card has a hover effect with an elevated shadow, reinforcing its interactive nature.

### 12.3 AI Personalised Recommendations

Below the navigation cards, a product grid labelled **"Recommended For You"** presents four AI-generated product suggestions tailored to the user's vehicle profile, purchase history, and browsing patterns.

### 12.4 Recent Orders Table

The lower portion of the dashboard displays a table of the user's five most recent orders, with the following columns:

| Column | Description |
|---|---|
| **Order** | Order number (or last 8 characters of the order ID) |
| **Date** | Order placement date in a human-readable format |
| **Status** | Colour-coded status badge |
| **Total** | Final order value in Euro |
| **View** | A button linking to the full order detail page |

Order statuses are colour-coded for rapid identification:

| Status | Colour |
|---|---|
| Pending | Yellow |
| Confirmed | Blue |
| Processing | Indigo |
| Shipped | Purple |
| Delivered | Green |
| Cancelled | Red |

A **"View All"** button links to the full Orders page. If no orders have been placed, an illustrative prompt encourages the user to browse products.

---

## 13. Profile Management

**URL:** `/profile`  
**Access:** Authenticated users only

The Profile Page is organised into three distinct tabs, each addressing a specific aspect of the user's account. The page features a prominent header card displaying the user's initials as an avatar, their full name, and email address.

> 📸 **[SCREENSHOT REQUIRED — SS-037]**  
> *Profile Page — header card with initials avatar and tab navigation.*

### 13.1 Profile Tab — Basic Information

This tab displays the user's name, email address, and phone number in a clean, read-only presentation. An **"Edit Profile"** button in the top-right corner of the card switches the view to an editable form.

**Editable Fields:**
- **Full Name** — Minimum 2 characters required.
- **Phone** — Optional contact number.

**Non-Editable Fields:**
- **Email** — Displayed but locked; a note reads *"Email cannot be changed"*.

After submitting changes, a success notification is displayed and the view returns to read-only mode.

> 📸 **[SCREENSHOT REQUIRED — SS-038]**  
> *Profile Tab — edit mode with form fields and Save/Cancel buttons.*

### 13.2 Security Tab — Password Management

The Security tab presents a reassurance message indicating that the user's password is securely stored. A **"Change Password"** button reveals a password change form with three fields:

- **Current Password** — Verification of the user's existing password.
- **New Password** — Minimum 6 characters.
- **Confirm New Password** — Must exactly match the new password.

Validation errors are displayed inline. Upon success, the form is cleared and returns to the read-only view.

> 📸 **[SCREENSHOT REQUIRED — SS-039]**  
> *Security Tab — Change Password form with all three fields.*

### 13.3 Addresses Tab — Saved Delivery Addresses

The Addresses tab displays all saved delivery addresses for the user, rendered as cards with a map preview for each location. An **"Add Address"** button opens a modal form.

#### Address Card

Each address card displays:
- **Label** — Home, Work, or Other.
- **Address Details** — Street, city, district, postal code, country.
- **Phone** — Contact number associated with the address.
- **Default Badge** — A blue "Default" badge marks the primary delivery address.
- **Map Preview** — An interactive map thumbnail displaying the address location.
- **Actions:** Edit (pencil icon), Delete (trash icon), Set Default (text link).

> 📸 **[SCREENSHOT REQUIRED — SS-040]**  
> *Addresses Tab — address card with map preview, Default badge, and action buttons.*

#### Add/Edit Address Modal

A full-screen-overlay modal form enables adding or editing addresses with the following fields:

| Field | Notes |
|---|---|
| Label | Dropdown: Home / Work / Other |
| Phone | Contact number |
| Street Address | Required |
| City | Required |
| District | Neighbourhood or area |
| Postal Code | Optional |
| Country | Pre-filled as Syria; editable |
| Map Picker | Interactive map — click to pin exact location; auto-fills address fields |
| Set as Default | Checkbox — makes this the primary shipping address |

The integrated map picker allows users to click directly on a map to set the delivery pin point, after which the address fields are auto-populated from the map's reverse geocoding service.

> 📸 **[SCREENSHOT REQUIRED — SS-041]**  
> *Add Address modal showing all fields and the interactive map picker.*

---

## 14. My Vehicles

**URL:** `/vehicles`  
**Access:** Authenticated users only

The My Vehicles page enables users to register and manage their Chinese vehicles. Registered vehicles serve as the foundation of the platform's AI-powered compatibility engine, enabling automatic part matching throughout the shopping experience.

> 📸 **[SCREENSHOT REQUIRED — SS-042]**  
> *My Vehicles Page — hero header with vehicle cards displayed.*

> 📸 **[SCREENSHOT REQUIRED — SS-043]**  
> *Empty vehicles state with "Add Your First Vehicle" prompt.*

### 14.1 Vehicle Cards

Each registered vehicle is displayed as a card containing:

- **Brand & Model** — Displayed prominently in bold text.
- **Nickname** — An optional personal label (e.g., *"My Daily Driver"*).
- **Year** — The vehicle's manufacturing year, displayed with a calendar icon.
- **Engine Type** — e.g., *1.5L Turbo*.
- **Transmission** — Automatic, Manual, or CVT.
- **Mileage** — Displayed in kilometres.
- **Primary Badge** — The vehicle designated as primary is marked with a gold star badge reading "Primary" in the card's top-right corner, and has a blue ring border distinguishing it from other vehicles.

### 14.2 Vehicle Actions

Each vehicle card provides four action options in a bottom toolbar:

- **Set Primary** — Designates this vehicle as the active compatibility reference. The primary vehicle's compatibility data is used across all product pages and search results. Only one vehicle may be primary at a time.
- **Parts** (wrench icon) — Expands an inline panel below the card showing compatible parts for the vehicle (see Section 14.3).
- **Edit** (pencil icon) — Opens the edit modal pre-filled with the vehicle's current data.
- **Delete** (trash icon) — Triggers a confirmation dialogue before permanently removing the vehicle.

> 📸 **[SCREENSHOT REQUIRED — SS-044]**  
> *Vehicle card showing all details, Primary badge, and action buttons.*

### 14.3 Compatible Parts Panel

Clicking the "Parts" button on any vehicle card expands an inline section beneath the card. This panel, powered by the AI compatibility engine, displays products confirmed compatible with that specific vehicle. A category dropdown allows filtering by:

- All Categories
- Engine
- Brakes
- Suspension
- Electrical
- Body Parts
- Filters

Compatible products are shown in a two-column mini-grid within the panel.

> 📸 **[SCREENSHOT REQUIRED — SS-045]**  
> *Compatible Parts panel expanded under a vehicle card, showing compatible products.*

### 14.4 Add/Edit Vehicle Modal

Clicking "Add Vehicle" or "Edit" opens a full-screen-overlay modal form divided into three sections:

**Basic Information (Required)**
- **Brand** — Dropdown selector from the seven supported brands.
- **Model** — Text field (minimum 2 characters). Example: *Tiggo 7*.
- **Year** — Numeric input (valid range: 2000 to current year + 1).

**Specifications (Optional)**
- **Engine Type** — Text description. Example: *1.5L Turbo*.
- **Transmission** — Dropdown: Automatic / Manual / CVT.
- **Mileage (km)** — Current odometer reading.

**Additional Details (Optional)**
- **Nickname** — A personal label for the vehicle.
- **VIN** — Vehicle Identification Number.
- **Notes** — Any additional remarks about the vehicle.

> 📸 **[SCREENSHOT REQUIRED — SS-046]**  
> *Add Vehicle modal showing all three sections (Basic Info, Specifications, Optional).*

---

## 15. Orders & Order Tracking

### 15.1 Orders List Page

**URL:** `/orders`  
**Access:** Authenticated users only

This page presents a comprehensive table of all orders the user has placed, in reverse chronological order.

> 📸 **[SCREENSHOT REQUIRED — SS-047]**  
> *Orders List Page — table with multiple orders in various status states.*

Each row in the table displays:
- **Order Number**
- **Date Placed**
- **Number of Items**
- **Total Value**
- **Status Badge** (colour-coded as defined in Section 12.4)
- **View Button** — Links to the full order detail page.

### 15.2 Order Detail Page

**URL:** `/orders/{order-id}`  
**Access:** Authenticated users only

The Order Detail Page provides a complete, detailed view of a single order from placement through delivery.

> 📸 **[SCREENSHOT REQUIRED — SS-048]**  
> *Order Detail Page — full view showing tracking stepper, items, and sidebar.*

#### Order Header

The page header displays the **order number**, **placement date**, and a **status badge**. For orders that have not yet been shipped or delivered, a **"Cancel Order"** button is visible, enabling the customer to cancel prior to dispatch.

#### Order Progress Tracker (Stepper)

A prominent visual progress tracker illustrates the order's journey through five stages: **Pending → Confirmed → Processing → Shipped → Delivered**. Completed stages are indicated by filled circles with checkmarks, while the current stage is highlighted with a pulsing ring effect. A connecting progress bar fills proportionally to reflect the overall completion percentage.

For cancelled orders, the stepper is replaced by a red notice indicating cancellation.

> 📸 **[SCREENSHOT REQUIRED — SS-049]**  
> *Order Progress Stepper showing "Processing" as the current stage.*

#### Tracking Information

If a tracking number has been assigned by the logistics team, a dedicated tracking card displays:
- **Carrier Name** (e.g., DHL, FedEx, Aramex, UPS)
- **Tracking Number** — Displayed with a copy-to-clipboard button.
- **Estimated Delivery Date**
- **Track Shipment Online** — A hyperlink that opens the carrier's official tracking page in a new tab.

#### Order Items

A card listing all items in the order, each showing:
- Product thumbnail image
- Product name (clickable link to product page)
- Part number
- Quantity
- Unit price and line total

#### Status History

A chronological log of all status changes for the order, displayed in reverse order (most recent first), with timestamps and any notes added at each stage.

#### Shipping Address

Displayed in the right sidebar: the full delivery address used for this order.

#### Payment & Summary

Also in the right sidebar:
- **Payment Method** and **Payment Status**
- **Price Breakdown:** Subtotal, Shipping, Tax, Grand Total

---

## 16. Wishlist

**URL:** `/wishlist`  
**Access:** Authenticated users only

The Wishlist page serves as a personal product catalogue where users save items they are interested in purchasing at a future date. The wishlist persists across sessions and devices.

> 📸 **[SCREENSHOT REQUIRED — SS-050]**  
> *Wishlist Page — populated with saved items displayed in a product grid.*

> 📸 **[SCREENSHOT REQUIRED — SS-051]**  
> *Empty Wishlist state with prompt to browse products.*

Products are displayed in the same card format as the product catalogue. Each card retains the **filled red heart icon** indicating its saved status. Clicking the heart icon again **removes** the product from the wishlist after a brief confirmation. Users may directly **Add to Cart** from the wishlist without navigating to the product detail page.

The wishlist is synchronised with the header icon badge in real-time. Adding or removing items updates the count immediately.

---

## 17. AI Chatbot Assistant

The AI Chatbot is a persistent floating widget available on every page of the platform. It functions as a conversational assistant capable of answering product questions, guiding users through the search process, providing policy information, and suggesting relevant products.

> 📸 **[SCREENSHOT REQUIRED — SS-052]**  
> *Floating chat button in bottom-right corner with green "online" indicator.*

> 📸 **[SCREENSHOT REQUIRED — SS-053]**  
> *Chat window open showing welcome message and quick action buttons.*

### 17.1 Opening the Chat

A circular button with a chat bubble icon (💬) is permanently positioned in the bottom-right corner of every page. A small green pulsing dot indicates the assistant is online and available. Clicking the button opens the chat window.

### 17.2 Chat Window Structure

The chat window is a compact panel (approximately 400px wide, 600px tall) anchored to the bottom-right of the screen. It contains:

- **Header:** Displays the assistant's name ("AI Assistant"), status ("Online • Instant replies"), a clock icon for history, and a close button.
- **Messages Area:** A scrollable conversation thread.
- **Input Area:** A text field for composing messages and a send button.

### 17.3 Welcome Message & Quick Actions

Upon opening the chat for the first time in a session, the assistant greets the user and presents a set of quick-action buttons — pre-written prompts for common questions, such as:

- *"Find parts for my car"*
- *"Check compatibility"*
- *"Shipping info"*
- *"Return policy"*

Clicking a quick action automatically sends that message and receives an immediate response, enabling users to get answers without typing.

> 📸 **[SCREENSHOT REQUIRED — SS-054]**  
> *Chat window showing the assistant's response with a suggested product card.*

### 17.4 Conversation Flow

Messages from the user appear on the right side in blue bubbles; responses from the AI appear on the left in grey bubbles. Each message includes a timestamp.

When the assistant is processing a response, a typing indicator (three animated bouncing dots) appears to indicate activity, reinforcing the conversational feel.

### 17.5 Product Recommendations in Chat

When the assistant's response includes product suggestions, clickable product cards are displayed beneath the text response. Each card shows:
- Product image (if available)
- Product name
- Part number
- Price (in Euro)
- Stock status (In Stock / Out of Stock)
- A right-arrow icon indicating it is clickable

Clicking a product card closes the chat window and navigates directly to the product's detail page.

### 17.6 Context Awareness

The chatbot is aware of the page the user is currently viewing. When the chat is opened while on a Product Details page, the assistant has access to that product's information and can provide contextually relevant answers — such as compatibility details, warranty information, or installation guidance for that specific part.

### 17.7 Chat History (Authenticated Users)

For logged-in users, conversations are automatically saved to their account. A clock icon in the chat header opens the **Chat History** view, which lists all previous conversation sessions, each showing:
- Conversation title
- Last message preview
- Date and time of the last message
- Message count

Clicking any session loads its full conversation history for continuation or review. Individual sessions can be deleted using the trash icon that appears on hover.

A **"Start New Conversation"** button at the top of the history panel initiates a fresh session.

> 📸 **[SCREENSHOT REQUIRED — SS-055]**  
> *Chat History panel showing saved conversation sessions.*

### 17.8 Clearing a Conversation

Within an active conversation, a **"Clear conversation"** link below the input field removes all messages from the current session and begins fresh, while preserving previous sessions in the history.

For authenticated users, a small green indicator reading "Auto-saved" appears beside the clear button, confirming that the conversation is being preserved.

---

## 18. Footer & Informational Pages

The footer, present at the bottom of every page, provides navigational links to all informational and policy pages of the platform. These pages are accessible to all visitors regardless of authentication status.

> 📸 **[SCREENSHOT REQUIRED — SS-056]**  
> *Footer — full view showing all link groups.*

### 18.1 About Us Page

**URL:** `/about`

Provides the company's background, mission statement, team overview, and commitment to quality and customer service within the Chinese auto parts sector.

### 18.2 Customer Service Page

**URL:** `/customer-service`

A centralised help hub presenting contact options and self-service resources for customers needing assistance with orders, products, or account issues.

### 18.3 FAQ Page

**URL:** `/faq`

A comprehensive list of frequently asked questions covering topics such as order placement, payment, shipping, returns, and compatibility checking.

> 📸 **[SCREENSHOT REQUIRED — SS-057]**  
> *FAQ Page showing expandable question-and-answer sections.*

### 18.4 Support Page

**URL:** `/support`

A dedicated support centre with tools for customers to report issues, track support requests, and access help resources.

### 18.5 Return Policy Page

**URL:** `/returns`

Full documentation of the platform's return and refund policy, including eligibility criteria, return procedures, and refund timelines.

### 18.6 Shipping Policy Page

**URL:** `/shipping`

Comprehensive information about shipping methods, delivery times, geographic coverage, and applicable fees. The free shipping threshold of €500 is prominently explained.

### 18.7 Terms and Conditions

**URL:** `/terms`

The legal terms governing use of the platform, purchasing agreements, and user responsibilities.

### 18.8 Privacy Policy

**URL:** `/privacy`

Explanation of how the platform collects, uses, and protects user data in compliance with applicable regulations.

### 18.9 Legal Information

**URL:** `/legal`

Additional legal disclosures, licensing information, and regulatory compliance statements.

### 18.10 404 — Page Not Found

When a user navigates to a URL that does not exist within the platform, a dedicated error page is displayed with a clear message and a button to return to the Home Page.

> 📸 **[SCREENSHOT REQUIRED — SS-058]**  
> *404 Page Not Found error page.*

---

## 19. Theme & Appearance

### 19.1 Light and Dark Mode

The platform supports both **Light Mode** and **Dark Mode** interfaces. The mode is toggled using the sun/moon icon in the header. The system initially adopts the user's operating system theme preference and retains the user's manual selection for all subsequent visits via browser local storage.

Both modes are fully implemented across all pages, components, and states — including forms, modals, cards, tables, badges, and the chatbot interface.

> 📸 **[SCREENSHOT REQUIRED — SS-059]**  
> *Side-by-side comparison of the same page in Light Mode vs. Dark Mode (product details page recommended).*

### 19.2 Responsive Design

The platform is fully responsive and adapts its layout for three screen size categories:

| Breakpoint | Layout |
|---|---|
| **Mobile** (< 768px) | Single-column layouts, collapsible navigation, stacked cards |
| **Tablet** (768px – 1024px) | Two-column grids, partial sidebar usage |
| **Desktop** (> 1024px) | Full multi-column layouts, persistent sidebars, expanded navigation |

> 📸 **[SCREENSHOT REQUIRED — SS-060]**  
> *Home Page on mobile device — showing hero and navigation in mobile layout.*

---

## 20. Required Screenshots Index

The following table provides a complete reference of all screenshots required for this documentation. Screenshots should be captured from a live or staging environment with representative data populated.

| ID | Description | Page / Section |
|---|---|---|
| **SS-001** | Full header — Light Mode, desktop | Header |
| **SS-002** | Full header — Dark Mode, desktop | Header |
| **SS-003** | Account dropdown menu open | Header — User Menu |
| **SS-004** | Mobile navigation menu expanded (authenticated) | Header — Mobile |
| **SS-005** | Home Page hero — Light Mode | Home Page |
| **SS-006** | Home Page hero — Dark Mode | Home Page |
| **SS-007** | Popular search pills close-up | Home Page — Hero |
| **SS-008** | "Why Choose Us" four feature cards | Home Page — Features |
| **SS-009** | Supported brands grid | Home Page — Brands |
| **SS-010** | Trending Products section | Home Page — Trending |
| **SS-011** | Search bar in hero — placeholder visible | AI Search Bar |
| **SS-012** | Search bar with suggestions dropdown open | AI Search Bar |
| **SS-013** | Search bar with microphone icon | AI Search Bar — Voice |
| **SS-014** | Search Results Page — full view | Search Results |
| **SS-015** | NLP Analysis card with entity badges | Search Results — AI Card |
| **SS-016** | Filters panel expanded with active filters | Search Results — Filters |
| **SS-017** | Pagination controls | Search Results — Pagination |
| **SS-018** | All Products Page — full grid | All Products |
| **SS-019** | Categories Page — category cards grid | Categories |
| **SS-020** | Product Details Page — Light Mode full view | Product Details |
| **SS-021** | Product Details Page — Dark Mode full view | Product Details |
| **SS-022** | Product image gallery with thumbnails | Product Details — Gallery |
| **SS-023** | "Add to Cart" + "Buy Now" buttons (in-stock) | Product Details — Actions |
| **SS-024** | "Notify Me When In Stock" button (out-of-stock) | Product Details — Actions |
| **SS-025** | Compatibility badge with vehicle name | Product Details — Compatibility |
| **SS-026** | Product details: description, specs, compatibility tags | Product Details — Info |
| **SS-027** | "Frequently Bought Together" section | Product Details — FBT |
| **SS-028** | Shopping Cart — full view with items | Cart |
| **SS-029** | Empty cart state | Cart — Empty |
| **SS-030** | Individual cart item card | Cart — Item Card |
| **SS-031** | Checkout — Step 1: Shipping (saved addresses visible) | Checkout |
| **SS-032** | Checkout — Step 1: Validation errors visible | Checkout — Validation |
| **SS-033** | Checkout — Step 2: Payment methods | Checkout — Payment |
| **SS-034** | Registration page | Authentication |
| **SS-035** | Login page | Authentication |
| **SS-036** | User Dashboard — full view | Dashboard |
| **SS-037** | Profile Page — header card and tab navigation | Profile |
| **SS-038** | Profile Tab — edit mode with form | Profile — Edit |
| **SS-039** | Security Tab — Change Password form | Profile — Security |
| **SS-040** | Addresses Tab — address card with map preview | Profile — Addresses |
| **SS-041** | Add Address modal with map picker | Profile — Address Modal |
| **SS-042** | My Vehicles Page — hero header with vehicle cards | Vehicles |
| **SS-043** | My Vehicles — empty state | Vehicles — Empty |
| **SS-044** | Vehicle card with Primary badge and action buttons | Vehicles — Card |
| **SS-045** | Compatible Parts panel expanded under vehicle | Vehicles — Parts Panel |
| **SS-046** | Add Vehicle modal — all three sections | Vehicles — Modal |
| **SS-047** | Orders List Page — table with orders | Orders List |
| **SS-048** | Order Detail Page — full view | Order Detail |
| **SS-049** | Order Progress Stepper — mid-process stage | Order Detail — Stepper |
| **SS-050** | Wishlist Page — populated with items | Wishlist |
| **SS-051** | Wishlist — empty state | Wishlist — Empty |
| **SS-052** | Floating chat button with online indicator | Chatbot |
| **SS-053** | Chat window open with welcome message | Chatbot — Open |
| **SS-054** | Chat response with product card suggestion | Chatbot — Product Card |
| **SS-055** | Chat History panel with saved sessions | Chatbot — History |
| **SS-056** | Footer — full view | Footer |
| **SS-057** | FAQ Page | FAQ |
| **SS-058** | 404 Page Not Found | 404 |
| **SS-059** | Light vs. Dark Mode comparison | Theme |
| **SS-060** | Mobile home page layout | Responsive Design |

---

*Total Screenshots Required: **60***

---

*End of Document*  
*Chinese Auto Parts — User Interface Guide v1.0*  
*© 2026 Chinese Auto Parts. All rights reserved.*
