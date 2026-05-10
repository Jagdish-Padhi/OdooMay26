# Traveloop - 100% Requirement Coverage & Bonus Plan

This plan is a vertical-slice strategy that ensures every single bullet point from the **Traveloop Problem Statement** is implemented, with additional premium features to secure a win.

---

## 🛑 Phase 0: Shared Quick Setup (30 mins)
*Crucial: One dev should do this to unblock the database structure.*
- [ ] **Database Schema:** Define all tables in `server/src/db/schema/`:
    - `trips` (id, name, dates, desc, cover_photo)
    - `stops` (id, trip_id, city_id, dates, order)
    - `activities` (id, stop_id, name, type, cost, duration, filters)
    - `checklists` (id, trip_id, item, category, status)
    - `notes` (id, trip_id, stop_id, content, timestamp)
    - `cities` (id, name, country, cost_index, popularity)
- [ ] **Database Sync:** Run `npm run db:push`.

---

## 🏗️ Phase 1: Auth & User Control (PDF Features 1 & 12)
**Pick this to build the app security and personalization.**
- [ ] **Login/Signup:** Complete flow with validation, Signup link, and **"Forgot Password"**.
- [ ] **User Profile:** Settings page to update name, photo, email, and **Language preferences**.
- [ ] **Account Safety:** Implement the **"Delete Account"** functionality.
- [ ] **Foundation:** Build the Dashboard Sidebar and premium Landing Page.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - Implement **Dark/Light Mode** (Premium feel).
    - Add **Framer Motion page transitions** for a smooth app experience.

---

## ✈️ Phase 2: Discovery & Trip Shell (PDF Features 2, 3, 4, 7)
**Pick this to build the core trip management experience.**
- [ ] **Trip CRUD:** Full management for Trip name, dates, description, and **Cover Photo upload**.
- [ ] **Dashboard:** Welcome message, recent trips list, and **Recommended Destinations**.
- [ ] **City Search:** Search interface showing **Country, Cost Index, and Popularity** for cities.
- [ ] **Trip Cards:** Summary data showing name, date range, and **Destination count**.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - Integrate **Unsplash API** to auto-fetch city images if the user doesn't upload a photo.
    - Add **Skeleton Loaders** for a "fast-loading" professional feel.

---

## 🗺️ Phase 3: The Itinerary Engine (PDF Features 5, 6, 8)
**Pick this for the most complex interactive logic.**
- [ ] **Builder:** Interface to add cities, dates, and assign activities to each stop.
- [ ] **Itinerary View:** Day-wise layout with **Calendar vs. List View Toggle**.
- [ ] **Activity Search:** Search for things to do with **Filters (Type, Cost, Duration)**.
- [ ] **Management:** Reorder cities and manage activity blocks with time/cost.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - **Drag-and-Drop** reordering for both stops and activities.
    - **Leaflet.js Map integration** to visualize the trip path between cities.

---

## 💰 Phase 4: Financials & Journals (PDF Features 9, 10, 13)
**Pick this to handle the "Planning" and "Organization" tools.**
- [ ] **Budget Engine:** Cost breakdown by **Transport, Stay, Activities, and Meals**.
- [ ] **Visuals:** Financial summary using **Pie/Bar Charts** and **Average cost per day**.
- [ ] **Checklist:** Item management categorized by **Clothing, Documents, Electronics**.
- [ ] **Journal:** Simple text note-taking tied to a specific trip **or a specific stop**.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - **Budget Alerts:** Progress bars that turn red if a day's cost exceeds the average budget.
    - **Weather Forecast:** Integration showing expected weather for each stop's dates.

---

## 🔗 Phase 5: Social & Export (PDF Feature 11)
**Pick this for the final presentation and sharing tools.**
- [ ] **Public View:** Sharable public URL displaying a read-only version of the itinerary.
- [ ] **Collaboration:** **"Copy Trip"** button for others to duplicate the plan.
- [ ] **Export:** Print-optimized view or **PDF Generation** for the full itinerary.
- [ ] **Sharing:** Social media sharing links.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - **WhatsApp Sharing** with a pre-filled invite message.
    - **QR Code Generator** on the trip page for easy mobile access.

---

## 🤖 Phase 6: Admin & Intelligence (PDF Feature 14)
**Pick this for advanced platform monitoring.**
- [ ] **Admin Dashboard:** Interface to track **User Trends, Trip Data, and Platform Usage**.
- [ ] **Analytics:** Tables/Charts for **Top Cities, Popular Activities, and Engagement**.
- [ ] **Management:** Admin tools to manage users and content.
- **🚀 EXTRA / BONUS (To Stand Out):**
    - **AI Trip Assistant (Gemini API):** An "Auto-Plan" button that generates a full itinerary based on city and budget.

---

## 🏁 Final Submission Checklist
- [ ] Mobile responsive layout.
- [ ] Form validations on all inputs.
- [ ] Success/Error toast notifications.
- [ ] Database seeded with sample Cities/Activities.
