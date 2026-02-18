# Chinese Auto Parts — Admin Console Interface Guide

**Platform Name:** Chinese Auto Parts — Admin Console  
**Version:** 1.0  
**Document Type:** Administrator Interface Documentation  
**Language:** English  
**Date:** February 2026  

---

## Table of Contents

1. [Admin Console Overview](#1-admin-console-overview)
2. [Admin Layout & Navigation](#2-admin-layout--navigation)
3. [Overview Dashboard](#3-overview-dashboard)
4. [Orders Management](#4-orders-management)
5. [Order Detail & Fulfilment](#5-order-detail--fulfilment)
6. [Products Management](#6-products-management)
7. [Product Form — Create & Edit](#7-product-form--create--edit)
8. [Users Management](#8-users-management)
9. [User Detail Page](#9-user-detail-page)
10. [Categories Management](#10-categories-management)
11. [Suppliers Management](#11-suppliers-management)
12. [Analytics & Reporting](#12-analytics--reporting)
13. [AI & Chatbot Analytics](#13-ai--chatbot-analytics)
14. [System Settings](#14-system-settings)
15. [Access Control & Security](#15-access-control--security)
16. [Required Screenshots Index](#16-required-screenshots-index)

---

## 1. Admin Console Overview

The **Admin Console** is a dedicated back-office interface exclusively accessible to users with the `administrator` role. It is completely separate from the customer-facing storefront — it uses its own layout, routing, and design system — and provides comprehensive control over every operational aspect of the platform.

The console is accessible at the base route `/admin` and is protected by a route guard that validates both authentication and administrator-level role before granting access.

### Key Capabilities

| Capability | Description |
|---|---|
| **Dashboard KPIs** | Real-time revenue, order, and customer metrics |
| **Order Fulfilment** | Full order lifecycle management with tracking |
| **Product Catalogue** | Create, edit, and manage all product listings |
| **User Administration** | Role management, activation, and user oversight |
| **Category Hierarchy** | Tree-structured category management |
| **Supplier Approval** | Supplier onboarding and status control |
| **Analytics** | Revenue, order, and user growth charts |
| **AI Analytics** | Chatbot session monitoring |
| **System Settings** | Platform-wide configuration |

### Access Requirements

| Condition | Behaviour |
|---|---|
| Not authenticated | Redirected to the login page |
| Authenticated but not administrator | Redirected to the storefront home page |
| Authenticated as administrator | Full access to the admin console |

---

## 2. Admin Layout & Navigation

The Admin Console uses a dedicated full-height layout — the `AdminLayout` — which replaces the storefront header and footer entirely. It consists of two persistent regions: a dark-themed sidebar on the left and a light content area on the right.

> 📸 **[SCREENSHOT REQUIRED — SS-001]**  
> *Full admin layout — dark sidebar with navigation sections, sticky header with breadcrumbs, and main content area. Desktop view.*

### 2.1 Admin Sidebar

The sidebar uses a deep dark background (`#0f1117`) and spans the full height of the viewport. It is divided into four labelled navigation sections:

#### Main
- **Overview** — The dashboard home page with KPIs and charts.

#### Management
- **Orders** — Order list and fulfilment management.
- **Products** — Product catalogue and listings.
- **Categories** — Category hierarchy editor.
- **Suppliers** — Supplier approval and management.
- **Users** — Customer and administrator user management.

#### Insights
- **Analytics** — Revenue, order, and user growth reporting.
- **AI Analytics** — Chatbot and AI session statistics.

#### System
- **Settings** — Platform-wide configuration.

The active route is highlighted with a blue accent indicator on the left border of the navigation item and a lighter background, making the current section immediately identifiable. On mobile devices, the sidebar collapses and is revealed via the hamburger button in the header, with a translucent overlay backdrop covering the content area.

At the very bottom of the sidebar, a user profile card displays the logged-in administrator's avatar (initials), full name, email, and a green "online" status indicator.

### 2.2 Admin Header

A sticky header sits atop the content area and remains visible during vertical scrolling. It contains:

- **Breadcrumb Navigation** — Auto-generated from the current route path (e.g., *Admin > Orders > #ORD-00142*), with each segment as a clickable link for quick upward navigation.
- **Hamburger Button** (mobile only) — Opens the sidebar overlay on small screens.
- **User Avatar Dropdown** — Clicking the administrator's avatar reveals a small dropdown with:
  - Current user's name and email.
  - **Settings** link — Navigates to the system settings page.
  - **Sign Out** — Logs the administrator out and redirects to the login page.

### 2.3 Content Area

The main content area to the right of the sidebar is a scrollable region where all admin page content is rendered. It uses a light background consistent with modern back-office design conventions.

---

## 3. Overview Dashboard

**URL:** `/admin`  
**Access:** Administrator only

The Overview Dashboard is the landing page of the admin console. It provides an at-a-glance summary of platform health through KPI metrics, trend charts, and actionable summaries.

> 📸 **[SCREENSHOT REQUIRED — SS-002]**  
> *Overview Dashboard — full view showing time-based greeting, KPI cards row, revenue area chart, order status bar chart, recent orders list, low stock alerts, and top selling products panel.*

### 3.1 Personalised Greeting

The page opens with a time-sensitive greeting message (e.g., *"Good morning"*, *"Good afternoon"*, *"Good evening"*) addressed to the administrator by name, providing a welcoming and personalised context.

### 3.2 Alerts Bar

Directly beneath the greeting, a contextual alert row displays two dynamic notifications:
- **New Orders Today** — The number of orders received on the current calendar day.
- **Pending Orders** — The total count of orders awaiting action.

These alerts help administrators prioritise their workload immediately upon logging in.

### 3.3 KPI Cards

Four large metric cards are displayed in a responsive horizontal row:

| Card | Metric | Description |
|---|---|---|
| **Total Revenue** | € amount | Cumulative revenue from all completed orders |
| **Total Orders** | Count | All orders placed across all statuses |
| **Customers** | Count | Total registered customer accounts |
| **Products** | Count | Total product listings in the catalogue |

Each card includes an icon, a formatted value, and a descriptive label.

### 3.4 Revenue Chart

A full-width area chart renders daily revenue and order counts for the last 30 days. The dual-axis chart allows simultaneous comparison of revenue trends (in Euro) against order volume, helping identify correlation between the two metrics over time.

### 3.5 Order Status Distribution

A horizontal bar chart shows the breakdown of all orders by status — Pending, Confirmed, Processing, Shipped, Delivered, and Cancelled — with each bar labelled with both the absolute count and the percentage it represents of total orders.

### 3.6 Recent Orders List

A scrollable list displays the seven most recently placed orders, each showing:
- Order number
- Customer name
- Order total (in Euro)
- Status badge (colour-coded)
- Date placed

Each row is clickable and navigates directly to that order's detail page.

### 3.7 Low Stock Alerts

A panel lists products whose stock level has dropped to a critical threshold. Each entry shows the product name and a colour-coded horizontal progress bar representing the current stock level relative to a healthy baseline. This panel enables quick identification of items requiring restocking.

### 3.8 Top Selling Products

A ranked list combined with a bar chart presents the platform's best-performing products by units sold and revenue generated. This data informs stocking and promotional decisions.

### 3.9 Quick Actions

Two primary action buttons in the header of the recent orders section provide direct shortcuts:
- **Orders** — Navigates to the full orders management page.
- **Add Product** — Navigates directly to the new product creation form.

---

## 4. Orders Management

**URL:** `/admin/orders`  
**Access:** Administrator only

The Orders Management page provides a complete, searchable, and filterable view of all orders placed on the platform. It is the primary tool for day-to-day order processing and customer service activities.

> 📸 **[SCREENSHOT REQUIRED — SS-003]**  
> *Orders Management page — quick stats badges at top, search bar, status and payment filters, sortable orders table with overdue indicators, status badges, and pagination controls.*

### 4.1 Quick Stats Badges

At the top of the page, two dynamic informational badges provide immediate context:
- **New Today** — Number of orders received on the current day.
- **Needs Attention** — Orders flagged as requiring action (e.g., pending orders exceeding 24 hours).

### 4.2 Search

A search field at the top of the list accepts free-text input and matches against both the **order number** and the **customer name**. Results update dynamically as the administrator types.

### 4.3 Filters

Two dropdown filter controls narrow the displayed orders:

| Filter | Options |
|---|---|
| **Order Status** | All, Needs Attention, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled |
| **Payment Status** | All, Pending, Paid, Failed, Refunded |

The "Needs Attention" option is a compound filter that surfaces orders in a critical pending state, allowing quick identification of items that have been waiting too long without progress.

### 4.4 Orders Table

The results are displayed in a data table with the following columns:

| Column | Description |
|---|---|
| **Order Number** | Unique identifier, sortable |
| **Customer** | Full name and email address |
| **Date** | Creation date and time, sortable |
| **Amount** | Total order value in Euro, sortable |
| **Order Status** | Colour-coded badge |
| **Payment Status** | Colour-coded badge |
| **Actions** | Link to the order detail page |

Orders pending for more than 24 hours display a red **"Overdue"** indicator alongside the date, drawing immediate attention to delayed processing.

### 4.5 Status Badge Colour Coding

| Status | Colour |
|---|---|
| Pending | Yellow |
| Confirmed | Blue |
| Processing | Indigo |
| Shipped | Purple |
| Delivered | Green |
| Cancelled | Red |
| Paid | Green |
| Failed | Red |
| Refunded | Orange |

### 4.6 Pagination

Orders are paginated at 20 records per page. Navigation controls at the bottom of the table allow moving between pages.

---

## 5. Order Detail & Fulfilment

**URL:** `/admin/orders/{order-id}`  
**Access:** Administrator only

The Order Detail page is the primary workspace for managing the full lifecycle of an individual order — from acknowledgement through to delivery. It consolidates all relevant order data and provides tools for updating every aspect of the fulfilment process.

> 📸 **[SCREENSHOT REQUIRED — SS-004]**  
> *Order Detail page — full view showing order header with status badges, order items table, status timeline, tracking information form, customer and shipping sidebar, status update controls, admin notes, and print button.*

### 5.1 Order Header

The top section of the page displays:
- **Order Number** — Unique identifier in prominent typography.
- **Date Placed** — Creation timestamp.
- **Order Status Badge** — Colour-coded current status.
- **Payment Status Badge** — Current payment state.
- **Print Invoice** button — Triggers the browser print dialogue to produce a formatted invoice.

### 5.2 Order Items

A detailed table lists every product included in the order:
- Product thumbnail image
- Product name (clickable link to the product listing)
- Part number
- Quantity
- Unit price (€)
- Line total (unit price × quantity)

Below the items table, a financial summary displays: **Subtotal**, **Shipping**, **Tax**, **Discount** (if applicable), and **Grand Total**.

### 5.3 Status Timeline

A chronological timeline card shows the complete history of status changes for the order. Each entry in the timeline records:
- The status reached
- An optional administrative note attached at that stage
- The date and time of the change

The most recent event appears at the top (reverse chronological order).

### 5.4 Update Order Status

A dedicated control section allows the administrator to advance or modify the order's status:

- **Order Status Dropdown** — Options: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled.
- **Status Note** (optional text field) — An internal note to accompany the status change, recorded in the timeline.
- **Update Status** button — Submits the new status with a loading indicator during processing.

### 5.5 Tracking & Delivery

When an order is marked as Shipped, a tracking details form becomes active:

| Field | Description |
|---|---|
| **Carrier** | Dropdown: DHL, FedEx, UPS, Aramex, Other |
| **Tracking Number** | Text input with a copy-to-clipboard button |
| **Estimated Delivery Date** | Date picker |
| **Track Shipment Online** | Hyperlink that opens the carrier's tracking page |

If an order is set to Shipped status without a tracking number entered, a yellow warning alert is displayed reminding the administrator to complete the tracking information.

### 5.6 Update Payment Status

A separate control section manages the payment state independently of the order fulfilment status:

- **Payment Status Dropdown** — Options: Pending, Paid, Failed, Refunded.
- **Update Payment** button.

### 5.7 Admin Notes

A private text area for internal administrative notes that are **not visible** to the customer. These notes are preserved alongside the order record for future reference by the operations team.

### 5.8 Customer & Shipping Information

A sidebar on the right side of the page displays two information cards:

**Customer Information:**
- Full name
- Email address
- Phone number

**Shipping Address:**
- Complete formatted delivery address as provided at checkout.

---

## 6. Products Management

**URL:** `/admin/products`  
**Access:** Administrator only

The Products Management page provides a full listing of all product catalogue entries with search, filtering, bulk operations, and individual record actions.

> 📸 **[SCREENSHOT REQUIRED — SS-005]**  
> *Products Management page — search bar, bulk selection checkboxes, bulk action controls, sortable product table with thumbnail, part number, category, price, stock colour-coding, and active/inactive status badges, plus pagination.*

### 6.1 Search

A search field filters the product list in real time by **product name** or **part number**.

### 6.2 Bulk Selection & Bulk Actions

Each table row includes a checkbox for multi-selection. When one or more products are selected, a bulk action toolbar appears with:

- **Activate Selected** — Sets all selected products to active status, making them visible on the storefront.
- **Deactivate Selected** — Sets all selected products to inactive, hiding them from the storefront without deletion.

A "Select All" checkbox in the table header selects or deselects the entire current page.

### 6.3 Products Table

The table presents the following columns:

| Column | Description |
|---|---|
| **Checkbox** | For bulk selection |
| **Product** | Thumbnail image + product name (English) |
| **Part Number** | Unique identifier in monospaced font |
| **Category** | Assigned category name |
| **Price** | Selling price in Euro, sortable |
| **Stock** | Quantity with colour-coded badge (see below), sortable |
| **Status** | Active / Inactive badge |
| **Actions** | Edit and Delete buttons |

#### Stock Level Colour Coding

| State | Condition | Badge Colour |
|---|---|---|
| Out of Stock | 0 units | Red |
| Low Stock | ≤ 5 units | Amber |
| Normal | > 5 units | Grey/Green |

### 6.4 Individual Actions

Each product row provides two action buttons:
- **Edit** (pencil icon) — Navigates to the product edit form pre-filled with the product's current data.
- **Delete** (trash icon) — Opens a confirmation modal before permanently removing the product from the catalogue.

### 6.5 Add Product

A prominent **"Add Product"** button at the top-right of the page navigates to the new product creation form.

### 6.6 Pagination

Products are paginated at 20 records per page.

---

## 7. Product Form — Create & Edit

**URL:** `/admin/products/new` (create) | `/admin/products/{id}/edit` (edit)  
**Access:** Administrator only

The Product Form page serves dual purpose — creating new products and editing existing ones. When opened in edit mode, all fields are pre-populated with the product's current data. The form is organised into clearly delineated sections.

### 7.1 Bilingual Name & Description

Two sets of text fields, separated by a language label, accept the product name and full description in both **English** and **Arabic**. The English name is required; the Arabic name is optional but recommended for market reach.

### 7.2 Core Product Details

| Field | Required | Notes |
|---|---|---|
| **Part Number** | ✅ | Unique identifier for the part |
| **Brand** | ✅ | Vehicle manufacturer brand |
| **Condition** | ✅ | Dropdown: New / Used / Refurbished |
| **Price (€)** | ✅ | Selling price in Euro |
| **Original Price (€)** | ✗ | Used to display a crossed-out RRP |
| **Stock Quantity** | ✅ | Available inventory count |
| **Category** | ✅ | Dropdown of all active categories |

### 7.3 Status Flags

Two checkbox toggles control the product's visibility and promotion:
- **Active** — When checked, the product is visible on the storefront. Unchecking hides it from customers without deletion.
- **Featured** — When checked, the product is eligible to appear in featured product sections on the home page and search results.

### 7.4 Specifications

A dynamic key-value editor allows the addition of technical specifications. Each row contains a **Key** field (e.g., *Material*) and a **Value** field (e.g., *Steel*). Rows can be added with the "+ Add Specification" button and removed individually with the trash icon on each row.

### 7.5 Vehicle Compatibility

A dynamic compatibility matrix allows the administrator to define which vehicles this part is compatible with. Each compatibility entry requires:

| Field | Description |
|---|---|
| **Brand** | Vehicle manufacturer (e.g., Chery) |
| **Model** | Vehicle model name (e.g., Tiggo 7) |
| **Year From** | Start of compatible year range |
| **Year To** | End of compatible year range |

Entries can be added with the "+ Add Compatibility" button and removed individually. Multiple entries allow a single part to be listed as compatible with several different vehicle configurations.

### 7.6 Form Actions

- **Save / Create Product** (primary blue button) — Validates all required fields. Inline error messages appear beneath any field failing validation. On success, the administrator is returned to the products list.
- **Cancel** — Returns to the products list without saving.

---

## 8. Users Management

**URL:** `/admin/users`  
**Access:** Administrator only

The Users Management page provides a complete directory of all registered platform users, with tools to search, filter, manage roles, control account status, and remove accounts.

### 8.1 Search

A search field accepts free-text input and filters users by **name**, **email address**, or **phone number**.

### 8.2 Filters

Two dropdown filters narrow the user list:

| Filter | Options |
|---|---|
| **Role** | All, Customer, Supplier, Administrator |
| **Status** | All, Active, Inactive |

### 8.3 Users Table

| Column | Description |
|---|---|
| **User** | Avatar (initials), full name, and email |
| **Phone** | Contact phone number |
| **Role** | Colour-coded badge (see below) |
| **Status** | Active / Inactive badge |
| **Joined** | Account registration date, sortable |
| **Actions** | View details, Activate/Deactivate, Delete |

#### Role Badge Colour Coding

| Role | Badge Colour |
|---|---|
| Administrator | Purple |
| Supplier | Blue |
| Customer | Grey |

### 8.4 Individual Actions

- **View** (eye icon) — Navigates to the User Detail page for the full profile and management controls.
- **Activate / Deactivate** (toggle icon) — Immediately changes the user's account status without requiring navigation to the detail page.
- **Delete** (trash icon) — Opens a confirmation modal before permanently removing the user account and all associated data.

### 8.5 Pagination

Users are paginated at 20 records per page.

---

## 9. User Detail Page

**URL:** `/admin/users/{user-id}`  
**Access:** Administrator only

The User Detail page consolidates all information about a specific user and provides management controls for their role and account status.

### 9.1 Profile Card

A summary card at the top of the page displays:
- Avatar (large initials)
- Full name
- Email address
- Phone number
- Registration date
- Last login date and time
- Account status badge (Active / Inactive)

### 9.2 Statistics Card

A metrics card adjacent to the profile card presents two key figures:
- **Total Orders** — Lifetime order count for this user.
- **Total Spent** — Cumulative order value across all completed purchases, in Euro.

### 9.3 Manage User

A management control panel provides two editable fields:

| Control | Options |
|---|---|
| **Role** | Customer, Supplier, Administrator |
| **Account Status** | Active, Inactive |

A **"Save Changes"** button submits any modifications with a loading indicator. A success notification confirms when changes have been applied.

### 9.4 Supplier Information (Conditional)

When the selected user holds the Supplier role, an additional information panel is displayed showing:
- **Business Name**
- **Business Licence Number**
- **Tax Number**

This panel does not appear for customers or administrators.

### 9.5 Order History

A list of the user's most recent orders is displayed at the bottom of the page. Each entry shows:
- Order number (clickable link to the order detail page)
- Date placed
- Total value (€)
- Status badge

This allows administrators to quickly review a user's purchase history without navigating to the orders section separately.

---

## 10. Categories Management

**URL:** `/admin/categories`  
**Access:** Administrator only

The Categories Management page provides a full hierarchical editor for the product taxonomy, supporting tree and list views and full CRUD operations on category nodes.

> 📸 **[SCREENSHOT REQUIRED — SS-006]**  
> *Categories Management page — statistics cards row, view mode toggle (Tree/List), search bar, expandable tree view with depth colour coding, children and product count badges, and the Add Category modal with bilingual fields and parent selector.*

### 10.1 Statistics Cards

Four metric cards are displayed at the top of the page:

| Card | Description |
|---|---|
| **Total Categories** | All category records in the system |
| **Root Categories** | Top-level categories with no parent |
| **Subcategories** | All categories with a parent category |
| **Active** | Categories currently visible on the storefront |

### 10.2 View Modes

A toggle control switches between two rendering modes:

#### Tree View
The category hierarchy is rendered as an expandable tree with visual connector lines. Each node in the tree displays:
- Expand/Collapse arrow (if the category has children)
- Category name
- **Depth badge** — Colour-coded by hierarchy level (Level 0, 1, 2, etc.)
- **Children count badge** — Number of immediate subcategories
- **Products badge** — Number of products assigned to this category
- Active / Inactive status indicator
- Edit and Delete action buttons (visible on hover)

#### List View
A flat list of all categories with depth indicators (indentation) showing the parent-child relationship. Each row displays the category name, level badge, and action buttons.

### 10.3 Search

A search field filters the displayed categories in real time by category name, highlighting matching nodes in both tree and list views.

### 10.4 Add / Edit Category Modal

Clicking **"Add Category"** or the edit icon on any category opens a modal overlay form with the following fields:

| Field | Notes |
|---|---|
| **Name (English)** | Required |
| **Name (Arabic)** | Optional |
| **Description (English)** | Optional |
| **Description (Arabic)** | Optional |
| **Parent Category** | Dropdown of all existing categories; a category cannot be set as its own parent |

A language tab switcher at the top of the modal toggles between the English and Arabic field sets.

### 10.5 Delete Category

Clicking the delete icon on any category opens a confirmation modal. Deletion is permanent and cannot be undone.

---

## 11. Suppliers Management

**URL:** `/admin/suppliers`  
**Access:** Administrator only

The Suppliers Management page provides oversight of all registered supplier accounts, enabling the administrator to approve or suspend their access to the platform.

### 11.1 Search

A search field filters suppliers by **name**, **email address**, or **business name**.

### 11.2 Status Filter

A dropdown filters the list by supplier status:
- **All** — All registered suppliers.
- **Approved** — Suppliers with active, approved accounts.
- **Suspended** — Suppliers whose accounts have been suspended.

### 11.3 Suppliers Table

| Column | Description |
|---|---|
| **Supplier** | Avatar (initials), full name, and email |
| **Business Name** | Registered business name |
| **Licence** | Business licence number |
| **Products** | Count of products listed by this supplier |
| **Status** | Approved / Suspended badge |
| **Joined** | Registration date |
| **Actions** | View profile, Approve/Suspend |

### 11.4 Approval Workflow

- **Approve** — Grants the supplier full platform access, allowing their products to be listed and purchased.
- **Suspend** — Revokes platform access, preventing the supplier from listing new products or fulfilling orders.

The status transition is applied immediately upon clicking the action button, without requiring a confirmation step.

### 11.5 View Profile

The **View** button navigates to the User Detail page for the selected supplier, providing access to their full profile, business information, and management controls.

### 11.6 Pagination

Suppliers are paginated at 20 records per page.

---

## 12. Analytics & Reporting

**URL:** `/admin/analytics`  
**Access:** Administrator only

The Analytics page provides visual reporting across revenue, order activity, and user growth, enabling data-informed management decisions.

> 📸 **[SCREENSHOT REQUIRED — SS-007]**  
> *Analytics page — period selector (Daily/Weekly/Monthly), dual-axis revenue and orders bar chart, orders by status donut chart, orders by payment status donut chart, user growth line chart, and top 10 selling products table.*

### 12.1 Period Selector

Three buttons at the top of the page control the time resolution of all charts:
- **Daily** — Data points for each day.
- **Weekly** — Data aggregated by week.
- **Monthly** — Data aggregated by month.

Selecting a period immediately refreshes all charts on the page to reflect the chosen granularity.

### 12.2 Revenue & Orders Chart

A dual-axis bar chart renders:
- **Revenue** (left Y-axis, in Euro) — Shown as taller bars in blue.
- **Order Count** (right Y-axis) — Shown as shorter bars in a contrasting colour.

The shared X-axis represents the time period. This side-by-side comparison makes it easy to identify whether revenue growth is driven by order volume or by higher-value individual orders.

### 12.3 Orders by Status

A donut chart breaks down the distribution of all orders across their status states: Pending, Confirmed, Processing, Shipped, Delivered, and Cancelled. A legend beside the chart labels each segment with its status name and percentage.

### 12.4 Orders by Payment Status

A second donut chart provides the equivalent breakdown by payment status: Pending, Paid, Failed, and Refunded.

### 12.5 User Growth

A line chart tracks daily new user registrations over the last 30 days, visualising platform growth trends and identifying periods of increased or decreased user acquisition.

### 12.6 Top 10 Selling Products

A ranked table lists the ten best-performing products with the following columns:
- Rank (#)
- Product name
- Units sold
- Total revenue generated (€)

This report aids in identifying inventory priorities and high-demand items for promotional campaigns.

---

## 13. AI & Chatbot Analytics

**URL:** `/admin/ai`  
**Access:** Administrator only

The AI Analytics page monitors the performance and usage of the platform's integrated AI Chatbot Assistant, providing visibility into customer engagement with the conversational AI feature.

### 13.1 KPI Cards

Three metric cards are displayed at the top of the page:

| Card | Description |
|---|---|
| **Total Chat Sessions** | All-time count of chatbot conversation sessions |
| **Sessions (Last 30 Days)** | Sessions initiated within the past 30 days |
| **Recent Sessions** | Sessions initiated within the last 7 days |

### 13.2 Daily Chat Sessions Chart

A line chart plots the number of chatbot sessions initiated per day over the last 30 days. This chart helps identify usage patterns, peak periods, and the impact of platform events or promotions on chatbot engagement.

### 13.3 Recent Sessions List

A table of recent chatbot sessions is displayed below the chart, showing:

| Column | Description |
|---|---|
| **Session Number** | Sequential identifier for the session |
| **User** | Customer name (or "Guest" if unauthenticated) |
| **Messages** | Total number of messages exchanged in the session |
| **Date** | Session initiation timestamp |

This list provides a rapid audit trail of recent chatbot activity, useful for quality assurance and identifying sessions that may warrant follow-up.

---

## 14. System Settings

**URL:** `/admin/settings`  
**Access:** Administrator only

The Settings page provides centralised configuration for all platform-wide operational parameters, organised into four tabbed sections.

> 📸 **[SCREENSHOT REQUIRED — SS-008]**  
> *Settings page — tab navigation bar (General, Shipping, Tax, Notifications) with the General tab active, showing Site Name, Contact Email, Currency, and Default Language fields, and the Save Changes button.*

### 14.1 General Tab

| Field | Type | Notes |
|---|---|---|
| **Site Name** | Text input | The platform's display name |
| **Contact Email** | Email input | Primary customer contact address |
| **Currency** | Dropdown | Euro (€) / Syrian Pound (SYP) |
| **Default Language** | Dropdown | English / Arabic |

### 14.2 Shipping Tab

| Field | Type | Notes |
|---|---|---|
| **Flat Shipping Rate** | Numeric input (€) | Applied to all orders below the free shipping threshold |
| **Free Shipping Threshold** | Numeric input (€) | Orders meeting or exceeding this value qualify for free shipping |

A live preview message beneath the threshold field dynamically reflects the current configured values, showing exactly what customers will see (e.g., *"Add €X more for free shipping"*).

### 14.3 Tax Tab

| Field | Type | Notes |
|---|---|---|
| **Tax Rate (%)** | Numeric input | Applied to the order subtotal at checkout |

An example calculation is displayed below the input field, showing the tax amount on a hypothetical order value using the entered rate. When the rate is set to 0%, a note is displayed indicating that tax is currently disabled.

### 14.4 Notifications Tab

| Setting | Type | Description |
|---|---|---|
| **Low Stock Threshold** | Numeric input | Products at or below this stock level trigger a low stock alert in the dashboard |
| **New Order Notifications** | Toggle switch | Enable/disable notifications for incoming orders |
| **Low Stock Notifications** | Toggle switch | Enable/disable alerts when products reach the low stock threshold |

### 14.5 Save Changes

A **"Save Changes"** button at the bottom of each tab submits the configuration. The button transitions to a loading state during the API call and displays a success confirmation once the settings have been saved.

---

## 15. Access Control & Security

### 15.1 AdminRoute Guard

All routes under `/admin` are protected by the `AdminRoute` component, which performs two sequential checks on every access attempt:

1. **Authentication Check** — Verifies that a valid authentication token exists in the user's session. If no token is found, the user is immediately redirected to the `/login` page.
2. **Role Check** — Verifies that the authenticated user's role is `administrator`. If the user is authenticated but holds a different role (e.g., `customer` or `supplier`), they are redirected to the storefront home page.

Only when both checks pass does the system render the requested admin page.

### 15.2 Session Management

Administrator sessions follow the same token-based authentication used by the storefront. Signing out via the admin header dropdown invalidates the session token and redirects to the login page. The logout action requires no additional confirmation.

### 15.3 Role-Based Visibility

The admin console is entirely invisible to non-administrator users. No navigation links, redirects, or references to the `/admin` route are presented anywhere within the storefront interface, keeping the administrative back-office inaccessible to ordinary platform users.

---

## 16. Required Screenshots Index

| ID | Description | Page / Section |
|---|---|---|
| **SS-001** | Admin layout — dark sidebar with all navigation sections, sticky header with breadcrumbs, and light content area | Admin Layout |
| **SS-002** | Overview Dashboard — KPI cards, revenue chart, order status chart, recent orders list, low stock alerts, and top products | Dashboard |
| **SS-003** | Orders Management — quick stats, search/filter controls, sortable table with overdue indicators and status badges | Orders |
| **SS-004** | Order Detail — order items, status timeline, tracking form, status update controls, admin notes, and customer sidebar | Order Detail |
| **SS-005** | Products Management — bulk selection, sortable table with stock colour-coding, status badges, and individual actions | Products |
| **SS-006** | Categories Management — statistics cards, tree view with depth badges and product counts, and Add Category modal | Categories |
| **SS-007** | Analytics — period selector, dual-axis revenue/orders chart, status donut charts, user growth line chart, top products table | Analytics |
| **SS-008** | Settings — tab navigation with General tab active showing all configuration fields and Save Changes button | Settings |

---

*Total Screenshots Required: **8***

---

*End of Document*  
*Chinese Auto Parts — Admin Console Interface Guide v1.0*  
*© 2026 Chinese Auto Parts. All rights reserved.*
