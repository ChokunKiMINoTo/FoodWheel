# 🎡 FoodWheel — Random Restaurant Picker

A fun, **Doraemon-themed** web app that spins a wheel to decide where to eat. Filter by budget, cuisine, group size, and more — then let fate choose!

Built with **React 19 + Vite**, styled with vanilla CSS, data persisted in **localStorage**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Spin Wheel** | Canvas-based wheel with smooth 3s ease-out animation |
| 🔍 **Smart Filters** | People count, budget ($–$$$$), cuisine, max time, open now, favorites |
| 📋 **Result Card** | Restaurant details, spin again, exclude, Google Maps link |
| 🕐 **History** | Scrollable bar of recent picks |
| 🍽️ **Restaurant CRUD** | Add, edit, delete with slide-in drawer form + validation |
| ⭐ **Favorites** | Toggle favorite on any restaurant |
| 📥 **CSV Import/Export** | Bulk manage your restaurant list |
| 🐱 **Doraemon Theme** | Blue/red/yellow palette, floating clouds, bell icon, red-nose wheel center |
| ♿ **Accessible** | ARIA roles, keyboard navigation, screen reader support |
| 🐳 **Docker Ready** | Multi-stage Dockerfile + nginx for cloud deployment |

---

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173/** — 12 sample restaurants are pre-loaded.

### Production (Docker)

```bash
docker compose up -d --build
```

Serves on **port 80**. Change the port in `docker-compose.yml` if needed.

---

## 📁 Project Structure

```
src/
├── main.jsx                  # Entry point + BrowserRouter
├── App.jsx                   # Nav bar, lazy routes, RestaurantProvider
├── index.css                 # Full Doraemon design system
├── assets/
│   └── jingle-bell.png       # Nav bell icon
├── context/
│   └── RestaurantContext.jsx  # Shared state (useReducer + Context)
├── store/
│   ├── sampleData.js          # 12 seed restaurants + option constants
│   └── restaurantStore.js     # localStorage CRUD, filters, CSV I/O
├── pages/
│   ├── WheelPage.jsx          # Filter + Wheel + Result + History
│   └── RestaurantPage.jsx     # Card grid + search + import modal
└── components/
    ├── SpinWheel.jsx          # Canvas wheel + spin animation
    ├── FilterPanel.jsx        # Filter controls (memo'd)
    ├── ResultCard.jsx         # Picked restaurant details (memo'd)
    ├── HistoryBar.jsx         # Recent picks (memo'd)
    └── RestaurantForm.jsx     # Add/Edit drawer with validation
```

---

## 🏗️ Tech Stack

- **React 19** + **React Router 7**
- **Vite 7** (dev server + build)
- **Vanilla CSS** with CSS custom properties
- **localStorage** for persistence
- **PropTypes** for runtime type checking
- **Docker** + **nginx** for deployment

---

## 🔧 Restaurant Data Model

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `cuisineTypes` | string[] | ✅ |
| `priceRange` | `$` `$$` `$$$` `$$$$` | ✅ |
| `location` | string | |
| `timeToServe` | number (minutes) | |
| `minPeople` / `maxPeople` | number | |
| `isOpenNow` | boolean | |
| `dineOptions` | string[] | |
| `dietTags` | string[] | |
| `spiceLevel` | `None` `Mild` `Medium` `Hot` | |
| `rating` | 1–5 | |
| `notes` | string | |
| `linkGoogleMaps` | URL | |
| `isFavorite` | boolean | |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🐳 Docker Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage: Node 20 build → nginx serve |
| `nginx.conf` | SPA fallback, gzip, static asset caching |
| `docker-compose.yml` | One-command deployment |
| `.dockerignore` | Lean build context |

---

## 📝 License

MIT