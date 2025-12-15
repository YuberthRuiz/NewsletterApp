# **📘 Product Requirements Document (PRD) — AdCalendar Pro (MVP)**  
**Version:** 1.0  
**Owner:** Yuberth  
**Date:** Today  

---

# **1. Product Summary**

AdCalendar Pro is a lightweight plug-in and dashboard that allows newsletter creators to manage and sell advertising slots using a visual calendar and a self-serve booking page for sponsors.

The MVP enables creators to:
- Define ad slot types  
- View a calendar with available/booked slots  
- Share a public booking page  
- Collect payment and creative assets  

Sponsors can:
- View available dates  
- Book a slot  
- Pay through Stripe  
- Upload creative copy or files  

The goal of the MVP is to replace manual ad scheduling workflows (Google Sheets, PayPal links, email exchanges) with an automated system simple enough for a solo creator.

---

# **2. Users**

### **Primary Users**
- Newsletter creators (Beehiiv or manual mode)  
- Sponsors/Advertisers

### **Secondary Users**
- Internal admin (you)

---

# **3. User Flows**

## **3.1 Sponsor Booking Flow**
1. Sponsor visits creator’s public booking page  
2. Views available dates  
3. Selects date + slot type  
4. Enters company details + ad copy  
5. Uploads creative assets  
6. Pays via Stripe  
7. Confirmation shown + email sent  

## **3.2 Creator Setup Flow**
1. Creator registers or logs in  
2. Sets newsletter name + timezone  
3. Creates ad slot types  
4. Defines publishing days  
5. Calendar auto-populates  
6. Toggles availability  
7. Shares booking link  
8. Views booked ads  
9. Marks ads as fulfilled  

---

# **4. Scope (MVP)**

## **4.1 In Scope**
- Creator authentication  
- Calendar UI  
- Slot types  
- Editable ad availability  
- Public booking page  
- Stripe payment integration  
- Creative uploads  
- Sponsor + creator confirmation emails  
- Fulfillment toggle  
- Dashboard for booked ads

## **4.2 Out of Scope**
- Beehiiv/Substack API integrations  
- Analytics dashboards  
- Team features  
- Marketplace  
- Multi-currency  
- Discounts  
- White-label domains  

---

# **5. Functional Requirements**

## **5.1 Creator Dashboard**

### **FR-101 — Creator Registration & Login**
- Email/password signup  
- Password reset  
- 14-day session persistence  

### **FR-102 — Set Basic Profile**
Fields:
- Newsletter Name  
- Public Booking URL slug  
- Timezone  

### **FR-103 — Create Ad Slot Types**
Each slot:
- Slot name  
- Price  
- Max creatives (default = 1)  
Creators can create/edit/delete slot types.

### **FR-104 — Calendar View**
- Monthly grid  
- Slot status: available/booked/fulfilled  
- Creator toggles slot availability  

### **FR-105 — Manage Booked Ads**
List view for:
- Sponsor name  
- Date  
- Slot type  
- Payment status  
- Creative text  
- Creative file link  

### **FR-106 — Mark as Fulfilled**
- Toggle fulfills slot  
- Updates dashboard + calendar  

---

## **5.2 Public Booking Page**

### **FR-201 — Public Access**
- No login required  
- URL: `/booking/{creatorSlug}`  

### **FR-202 — Display Available Slots**
- Clickable dates with availability  
- Slot types + pricing  

### **FR-203 — Booking Form**
Fields:
- Sponsor name  
- Email  
- Website URL  
- Ad copy  
- Optional creative upload  

### **FR-204 — Payment Integration**
- Stripe Checkout  
- On success:  
  - Save booking  
  - Send confirmation email  
  - Mark slot as booked  

### **FR-205 — Confirmation State**
- Thank you page  
- Booking summary  
- Email confirmation  

---

## **5.3 Emails**

### **FR-301 — Sponsor Confirmation**
Includes:
- Booking date  
- Slot type  
- Ad copy  
- Stripe receipt  

### **FR-302 — Creator Notification**
Includes:
- Sponsor name  
- Slot details  
- Link to dashboard  

---

# **6. Non-Functional Requirements**

### **NFR-401 — Performance**
- Booking page loads < 2s  
- Calendar renders < 1s  

### **NFR-402 — Security**
- File-type restrictions  
- Stripe handles payment info  
- JWT sessions  

### **NFR-403 — Reliability**
- 99.5% uptime  
- Hosted on Vercel + Supabase  

### **NFR-404 — Usability**
- Mobile-friendly booking page  
- Desktop-focused dashboard  

---

# **7. Tech Stack Requirements**

### **Frontend**
- Next.js  
- TailwindCSS  
- React Big Calendar or FullCalendar  

### **Backend**
- Next.js API routes or Node/Express  
- Stripe  
- Supabase (auth, DB, storage)

---

# **8. Database Schema**

## **Creators**
- id (PK)  
- email  
- password_hash  
- newsletter_name  
- slug  
- timezone  
- created_at  

## **SlotTypes**
- id (PK)  
- creator_id (FK)  
- name  
- price  

## **Slots**
- id (PK)  
- creator_id (FK)  
- slot_type_id (FK)  
- date (DATE)  
- status: available | booked | fulfilled  

## **Bookings**
- id (PK)  
- slot_id (FK)  
- sponsor_name  
- sponsor_email  
- website_url  
- ad_copy  
- creative_file_url  
- payment_status  
- created_at  

---

# **9. Acceptance Criteria**

### **AC-01** Creator account setup works  
### **AC-02** Creator can create slot types  
### **AC-03** Slot availability toggles reflected publicly  
### **AC-04** Sponsor books + pays successfully  
### **AC-05** Creator receives notification  
### **AC-06** Creator can mark slot as fulfilled  
### **AC-07** Creative uploads stored + visible  

---

# **10. Ready for Development**
This PRD is ready for handoff to engineering or an AI coding agent.  

