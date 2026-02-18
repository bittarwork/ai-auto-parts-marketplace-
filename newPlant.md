---
name: User Interface Completion
overview: إتمام الواجهة الأمامية الخاصة بالمستخدمين عبر إضافة الميزات المفقودة وتحسين الميزات الموجودة عبر 4 مراحل مرتبة حسب الأولوية.
todos:
  - id: p1-1
    content: Create ProtectedRoute component and update App.jsx routes
    status: pending
  - id: p1-2
    content: Create vehicleService.js
    status: pending
  - id: p1-3
    content: Create VehiclesPage.jsx with full CRUD and add route
    status: pending
  - id: p2-1
    content: Enhance ProfilePage.jsx - add password change section
    status: pending
  - id: p2-2
    content: Enhance ProfilePage.jsx - add address management section
    status: pending
  - id: p2-3
    content: Update DashboardPage.jsx - add Vehicles quick card + fix error handling
    status: pending
  - id: p3-1
    content: Enhance CheckoutPage.jsx - load and select saved addresses
    status: pending
  - id: p3-2
    content: Improve OrderDetailPage.jsx - ConfirmModal + tracking info display
    status: pending
  - id: p4-1
    content: Enhance Header.jsx - add desktop user dropdown menu
    status: pending
  - id: p4-2
    content: Create NotFoundPage.jsx and update App.jsx
    status: pending
isProject: false
---

# User Interface Completion Plan

## Current State Summary

- Auth pages (Login/Register/ForgotPassword/Reset): complete
- Product browsing and search: complete
- Cart, Wishlist, Orders pages: complete with real API
- All backend services for vehicles exist but zero frontend implementation
- Address management missing from profile
- No reusable ProtectedRoute component (each page handles auth manually)

## Phase 1 - Core Architecture & Missing Features (High Priority)

### 1.1 - Create `ProtectedRoute` component

- New file: [frontend/src/components/common/ProtectedRoute.jsx](frontend/src/components/common/ProtectedRoute.jsx)
- Wraps routes requiring auth, redirects to `/login` if no token
- Update [frontend/src/App.jsx](frontend/src/App.jsx) to use it for: `/dashboard`, `/profile`, `/orders`, `/orders/:id`, `/wishlist`, `/checkout`, `/vehicles`

### 1.2 - Create `vehicleService.js`

- New file: [frontend/src/services/vehicleService.js](frontend/src/services/vehicleService.js)
- Methods: `getVehicles()`, `getPrimaryVehicle()`, `addVehicle()`, `updateVehicle()`, `deleteVehicle()`, `setPrimary()`

### 1.3 - Create `VehiclesPage.jsx`

- New file: [frontend/src/pages/VehiclesPage.jsx](frontend/src/pages/VehiclesPage.jsx)
- Features:
  - List user vehicles with brand/model/year
  - Add new vehicle form (Brand enum: Chery, Geely, MG, Haval, Great Wall, Changan, BYD)
  - Edit vehicle details
  - Set vehicle as Primary (used by AI compatibility search)
  - Delete vehicle with ConfirmModal
- Add route `/vehicles` in [frontend/src/App.jsx](frontend/src/App.jsx)

## Phase 2 - Profile & Account Enhancements (High Priority)

### 2.1 - Enhance `ProfilePage.jsx` - Password Change Section

- File: [frontend/src/pages/ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)
- Add separate form section for changing password (current password + new password + confirm)

### 2.2 - Enhance `ProfilePage.jsx` - Address Management

- File: [frontend/src/pages/ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)
- User model has `addresses[]` array, wire it to the UI
- Features: list saved addresses, add/edit/delete address, set default address

### 2.3 - Update `DashboardPage.jsx` - Add Vehicles Quick Card

- File: [frontend/src/pages/DashboardPage.jsx](frontend/src/pages/DashboardPage.jsx)
- Add "My Vehicles" card alongside Profile/Orders/Wishlist cards

## Phase 3 - Shopping Experience Improvements (Medium Priority)

### 3.1 - Enhance `CheckoutPage.jsx` - Saved Addresses

- File: [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx)
- Load user's saved addresses from profile
- Allow selecting a saved address or entering a new one
- Pre-fill form from primary/default address

### 3.2 - Improve `OrderDetailPage.jsx`

- File: [frontend/src/pages/OrderDetailPage.jsx](frontend/src/pages/OrderDetailPage.jsx)
- Replace `browser confirm()` with `ConfirmModal` component (already exists)
- Display tracking info section (Order model has `trackingInfo` field)

### 3.3 - Improve error handling in `DashboardPage.jsx`

- File: [frontend/src/pages/DashboardPage.jsx](frontend/src/pages/DashboardPage.jsx)
- Replace `console.error` with visible `Alert` component (already exists)
- Add retry mechanism on API failure

## Phase 4 - UI/UX Polish (Medium Priority)

### 4.1 - Enhance `Header.jsx` - Desktop User Dropdown

- File: [frontend/src/components/layout/Header.jsx](frontend/src/components/layout/Header.jsx)
- Add dropdown menu on desktop for logged-in users containing:
  - My Dashboard, My Profile, My Orders, My Vehicles, Wishlist, Logout
- Currently only shows icon linking to `/dashboard` on desktop

### 4.2 - Extract `NotFoundPage.jsx`

- New file: [frontend/src/pages/NotFoundPage.jsx](frontend/src/pages/NotFoundPage.jsx)
- Move inline 404 JSX from [frontend/src/App.jsx](frontend/src/App.jsx) into proper component
- Improve design with navigation links

## Files Summary

New files to create:

- `frontend/src/components/common/ProtectedRoute.jsx`
- `frontend/src/services/vehicleService.js`
- `frontend/src/pages/VehiclesPage.jsx`
- `frontend/src/pages/NotFoundPage.jsx`

Files to modify:

- `frontend/src/App.jsx` — add `/vehicles` route, apply ProtectedRoute
- `frontend/src/pages/ProfilePage.jsx` — password change + address management
- `frontend/src/pages/DashboardPage.jsx` — vehicles card + error handling
- `frontend/src/pages/CheckoutPage.jsx` — saved addresses
- `frontend/src/pages/OrderDetailPage.jsx` — ConfirmModal + tracking info
- `frontend/src/components/layout/Header.jsx` — desktop user dropdown

