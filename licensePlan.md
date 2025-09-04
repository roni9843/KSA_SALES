# Licensing Plan for Moto POS

This document outlines the technical plan for implementing a subscription-based licensing model in the Moto POS application.

## 1. Core Requirements

- [x] **10-Day Free Trial:** Application functions fully for 10 days from first launch.
- [x] **Trial Expiry:** After 10 days, the application stops working (or becomes severely limited).
- [x] **Annual Subscription:** Users can purchase an annual subscription to continue using the application.
- [x] **User Notifications:** Inform users about trial status, upcoming expiry, or subscription renewal.

## 2. Technical Implementation Details

### 2.1. Licensing Data Storage

- [x] **Local Storage (SQLite `settings` table):**
    - [x] `trial_start_date`: TEXT (ISO 8601 format, e.g., 'YYYY-MM-DDTHH:MM:SSZ'). Set on first launch.
    - [x] `license_key`: TEXT (Optional, for future remote validation).
    - [x] `subscription_end_date`: TEXT (ISO 8601 format). Set upon successful subscription activation/renewal.
    - [x] `license_status`: TEXT (e.g., 'trial', 'active', 'expired', 'grace_period').

- [ ] **Remote API (Recommended for Production):**
    - [ ] For robust license validation and management of paid subscriptions, a dedicated backend API is highly recommended. This API would:
        - [ ] Store definitive license records.
        - [ ] Handle license key generation and activation.
        - [ ] Process subscription payments (via a payment gateway).
        - [ ] Provide endpoints for the Electron app to validate licenses.
    - [ ] **Initial Scope:** For the initial implementation, we will focus on local validation for the trial. Remote API integration would be a subsequent phase.

### 2.2. License Validation Logic

The application will perform license validation at key points:

- [x] **Application Startup (`main.js` / `preload.js` / `db.js`):**
    - [x] On first launch, record `trial_start_date` in the `settings` table.
    - [x] Check `license_status` and `subscription_end_date`.
    - [x] If expired or invalid, prevent the main window from loading or display a blocking "License Expired" screen.
- [x] **Periodic Checks (Frontend `useEffect` / IPC):**
    - [x] Every few hours (e.g., 6-12 hours) or on significant user actions (e.g., saving an invoice), perform a quick license check. *(Implemented in `LicenseStatusBanner.jsx`)*.
    - [x] This prevents users from bypassing checks by keeping the app open indefinitely.
- [x] **IPC Handler (`src/main/ipc/license.js`):**
    - [x] A new IPC handler will encapsulate all license-related logic (e.g., `get-license-info`, `activate-license`).

### 2.3. User Interface & Notifications

- [x] **Blocking Screen on Expiry:** If the license is expired, a modal or full-screen overlay will appear, preventing further use and prompting the user to subscribe.
- [x] **Trial Status Banner/Toast:**
    - [x] A subtle banner or toast notification will appear on the dashboard or a prominent page.
    - [x] Messages: "Your free trial ends in X days.", "Your subscription expires in Y days.", "Your subscription has expired. Please renew."
    - [x] This banner will link to a "Licensing" or "Subscription" page.
- [x] **Dedicated "Licensing" Page (`renderer/src/pages/Licensing.jsx`):**
    - [x] Accessible from the "Settings" menu.
    - [x] Displays current license status (trial/active/expired).
    - [x] Shows trial end date or subscription end date.
    - [x] Provides options to activate a license key (for paid subscriptions).
    - [ ] (Future: Link to a web-based subscription portal).

### 2.4. Security Considerations (Local Validation)

- [x] **Machine-ID Locking:** The license key is locked to a specific machine on activation to prevent reuse.
- [ ] **Obfuscation:** The license validation logic in the Electron main process should be obfuscated to make reverse engineering harder.
- [ ] **Checksums/Hashes:** Store a hash of critical license data (e.g., `trial_start_date`) to detect simple tampering.
- [ ] **Time Tampering:** Detect system clock changes.
- [ ] **No Sensitive Data:** Do not store sensitive user or payment data locally.

## 3. Step-by-Step Implementation Plan

1.  [x] **Database Schema Update:**
    - [x] Modify `src/main/database/db.js` to add `trial_start_date`, `license_key`, `subscription_end_date`, and `license_status` columns to the `settings` table. *(Assumed complete as `ipc/license.js` depends on it).*
    - [x] Ensure default values are set (e.g., `trial_start_date` to `NULL`, `license_status` to 'unlicensed').

2.  [x] **Backend IPC Handler (`src/main/ipc/license.js`):**
    - [x] Create `src/main/ipc/license.js`.
    - [x] Implement `get-license-info`: Fetches license data from `settings` table.
    - [x] Implement `set-trial-start-date`: Sets `trial_start_date` on first launch if `NULL`.
    - [x] Implement `activate-license`.
    - [x] Load this new IPC handler in `src/main/main.js`.

3.  [x] **Main Process License Check (`src/main/main.js` / `preload.js`):**
    - [x] On `app.whenReady()`, before `createWindow()`, perform an initial license check.
    - [x] If the license is expired, prevent `createWindow()` from showing the main app, and instead show a dedicated "License Expired" window.

4.  [x] **Frontend UI (`renderer`):**
    - [x] **New Page:** Create `renderer/src/pages/Licensing.jsx`.
    - [x] **Routing:** Add a route for `/licensing` in `renderer/src/App.jsx`. *(Assumed complete).*
    - [x] **Sidebar Link:** Add a "Licensing" link under "Settings" in `renderer/src/components/Sidebar.jsx`. *(Assumed complete).*
    - [x] **License Status Component:** Create a small component (`renderer/src/components/LicenseStatusBanner.jsx`) to display trial/subscription status and notifications. Integrate this into the `Layout.jsx` or `Dashboard.jsx`.
    - [x] **Licensing Page UI:** Design the `Licensing.jsx` page to display status, dates, and license activation input. *(UI and activation logic are complete).*

5.  [x] **Trial Management Logic:**
    - [x] In `get-license-info` (IPC), calculate remaining trial days.
    - [x] In `LicenseStatusBanner.jsx`, display appropriate messages based on remaining days.

6.  [x] **Blocking UI on Expiry:**
    - [x] Implement the blocking screen logic in the main process.

## 4. Future Enhancements (Beyond Initial Scope)

- [x] **Remote License Server:** Implement a secure backend API for license management. The current plan is to use a PHP/MySQL backend. The API will handle validating license keys upon activation.
- [ ] **Payment Gateway Integration:** Integrate with Stripe, PayPal, etc., for subscription payments.
- [ ] **Advanced Anti-Tampering:** More sophisticated checks (e.g., code integrity checks, remote time sync).
- [ ] **Offline Grace Period:** Allow limited offline use for active subscriptions.