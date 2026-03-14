# 📡 SignalForge — Frontend

React + Vite frontend for the Telecom Plan Comparator.

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 18 + Vite 5                 |
| Routing     | React Router v6                   |
| HTTP Client | Axios (with interceptors)         |
| Charts      | Recharts                          |
| Icons       | Lucide React                      |
| Toasts      | React Hot Toast                   |
| Styling     | CSS Modules + CSS Custom Props    |
| Fonts       | Syne (display) + DM Sans (body)   |

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**  
API proxied to **http://localhost:8080** (Spring Boot must be running)

## Pages

| Route          | Description                              | Auth     |
|----------------|------------------------------------------|----------|
| `/`            | Dashboard — browse & filter all plans    | Public   |
| `/plans/:id`   | Plan detail + reviews                    | Public   |
| `/compare`     | Side-by-side plan comparison table       | Public   |
| `/reports`     | Charts: price, types, features           | Public   |
| `/login`       | Sign in                                  | Public   |
| `/register`    | Create account                           | Public   |
| `/profile`     | Current user info + logout               | Auth     |
| `/admin`       | Manage plans & users                     | Admin    |

## Key Features

- **Plan Browsing** — paginated grid with sort controls
- **Filter Panel** — filter by provider, type, price range, 5G, roaming, hotspot
- **Live Search** — instant client-side search by name/provider
- **Compare Bar** — floating bar appears when plans are selected; navigate to full comparison table
- **Comparison Table** — highlights cheapest, most data, best rated, best value
- **Reviews** — star rating + comment; delete own reviews
- **Reports** — 4 Recharts charts: avg price by provider, plan type pie, feature bar, price distribution
- **Admin Panel** — create/delete plans, promote/demote users
- **JWT Auth** — token stored in localStorage, auto-attached to all API calls

## Project Structure

```
src/
├── assets/
│   └── global.css          # Design tokens, resets, animations
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Navbar.module.css
│   └── ui/
│       ├── PlanCard.jsx / .css
│       ├── FilterPanel.jsx / .css
│       ├── ReviewForm.jsx / .css
│       └── CompareBar.jsx / .css
├── context/
│   ├── AuthContext.jsx      # JWT auth state
│   └── CompareContext.jsx   # Selected plans for comparison
├── hooks/
│   ├── usePlans.js          # usePlans, useFilteredPlans, usePlan, useProviders
│   └── useReviews.js
├── pages/
│   ├── Dashboard.jsx / .css
│   ├── PlanDetail.jsx / .css
│   ├── ComparePage.jsx / .css
│   ├── Reports.jsx / .css
│   ├── Login.jsx / Auth.css
│   ├── Register.jsx
│   ├── Profile.jsx / .css
│   └── Admin.jsx / .css
├── services/
│   ├── api.js              # Axios instance + interceptors
│   ├── authService.js
│   ├── planService.js
│   └── reviewService.js
├── utils/
│   └── formatters.js       # formatPrice, formatData, planTypeLabel …
├── App.jsx                  # Router + providers
└── main.jsx
```

## Design System

Dark industrial aesthetic with:
- **Font**: Syne (headings) + DM Sans (body)
- **Primary accent**: `#00d4ff` (cyan)
- **Secondary**: `#7c3aed` (violet), `#ff6b35` (orange)
- **Background**: `#0a0c10` → `#0f1117` → `#161b24`
- All tokens via CSS custom properties in `global.css`

## Default Credentials (dev seed)

| Username | Password  | Role        |
|----------|-----------|-------------|
| admin    | admin123  | ADMIN, USER |
| john     | john123   | USER        |
| jane     | jane123   | USER        |
