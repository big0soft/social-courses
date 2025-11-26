# Beta-E-Learning Platform Specification

## Overview
Beta E-Learning is an educational web platform offering online tutoring and study materials.  
It operates through prepaid subscription cards that allow students to access digital lessons and resources after activation.

---

## Website Structure

### Main Sections

- **Home Page**
  - Overview of the website and its services.
  - Highlights top teachers and featured courses.

- **Courses Page**
  - Displays all available subjects by academic field.
  - Shows subject description, teacher name, number of lessons, price, and a sample preview.

- **Subscription Cards / Sales Points Page**
  - Allows students to select payment methods:
    - Prepaid cards
    - Visa / MasterCard
    - Zain Cash
    - WhatsApp transfer
  - Lists all approved bookstores selling prepaid cards.
  - Includes search and Google Map integration.

- **FAQ & Support Page**
  - Answers common questions and provides support channels.

- **Login / Registration Page**
  - Students can create accounts and manage subscriptions.

- **Blog**
  - Educational articles and platform updates.

---

## Functional Features

### 1. Educational Content Management
- Add unlimited learning materials.
- Support for videos, PDFs, and external file links.
- Categorize content by academic field or specialization.
- Teachers can preview lessons before publishing.

### 2. User Management
- Register via email or phone number.
- Student dashboard to view enrolled courses.
- User roles: **Admin**, **Teacher**, **Student**.
- SMS integration to send account activation codes.

### 3. Payment & Subscriptions
- Supports:
  - **Paymob**, **Moyasar**, **Stripe** (Visa/MasterCard)
  - **Zain Cash**, bank transfer
  - **Prepaid Codes**
- Auto-activation of courses after payment confirmation.
- Requires agreement with online payment providers.

### 4. Educational Cards System
- Display card prices by subject or academic field.
- Input and verify activation codes.
- Immediate course activation and student account linking.

### 5. Sales Points Management
- Display approved bookstores and card vendors.
- Each listing includes:
  - Name
  - Address
  - Phone number
  - Website link
- Search and filter by region.
- Google Maps API integration for location display.

### 6. User Experience
- Fully responsive design for desktop, tablet, and mobile.
- Clean, modern, and intuitive interface.
- Fast performance and optimized loading.

### 7. Notification System
- Internal and email alerts when activating cards or subscriptions.
- Payment confirmation messages via email or WhatsApp.

---

## Technical Specifications

| Category | Description |
|-----------|-------------|
| **CMS** | WordPress (or Custom Laravel Development) |
| **Security** | SSL Certificate, Encrypted Login, Data Protection |
| **Performance** | CDN + Caching + Image Optimization |
| **Integrations** | Zoom API, Payment APIs, WhatsApp Chat |
| **Design** | Custom UI with Client Branding |
| **Languages** | Arabic / English (extendable) |
| **Backups** | Automatic Daily / Weekly Backups |
| **Version Control** | Git Version Control |
| **Admin Dashboard** | Modern Dashboard with Analytics and Sales Reports |

---

## Language Support
- Bilingual Interface: Arabic and English.

---

## Summary
The Beta E-Learning platform provides a scalable, secure, and user-friendly digital education experience with flexible payment systems, content management tools, and full integration capabilities.
