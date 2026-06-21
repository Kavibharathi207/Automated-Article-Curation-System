# 📰 BlogCurate

> A professional blog curation platform developed as a client project during an internship at **Infinit Solutions, Vadavalli, Coimbatore**.

BlogCurate is a modern, full-stack blog curation system built to aggregate, organize, score, and present curated blog content through an intelligent editorial workflow — powered by AI-driven editorial profiles and a seamless admin experience.

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| [Svelte 5](https://svelte.dev/) | Reactive UI framework |
| [Vite](https://vitejs.dev/) | Lightning-fast build tool & dev server |
| JavaScript (ES Modules) | Core language |
| Svelte Stores | Global state management |

---

## ✨ Key Features

- 📋 **Content Curation Dashboard** — Browse, filter, and manage curated blog articles
- 🧠 **AI-Powered Editorial Profiles** — Weekly analysis of 50 recent articles per theme to extract dominant keywords, covered sectors, and editorial identity
- 🎯 **Article Scoring & Recommendations** — Profiles guide downstream editorial decisions
- 🔄 **Profile Regeneration** — Manually trigger re-analysis per theme
- 📊 **Admin Panel** — Full control over themes, profiles, and editorial workflows
- 📱 **Responsive Design** — Optimized for desktop, tablet, and mobile

---
## 📸 Screenshots

# 🏠 Landing Page

### Landing Page - Hero Section

<img src="https://github.com/user-attachments/assets/d9523467-0991-4a04-b948-b6db309ab610" />

### Landing Page - Features Section

<img src="https://github.com/user-attachments/assets/c177f2ac-8785-439d-89ce-1d3c909e4d52" />

---

# 👤 User Panel

### Home Page

<img src="https://github.com/user-attachments/assets/05d43e9f-b8b0-4c19-a2a3-e460a16c5eda" />

<img src="https://github.com/user-attachments/assets/ea68ac5b-936f-4f96-8eb0-b2dd341fda1d" />

### Discover

<img src="https://github.com/user-attachments/assets/4845723e-5c2e-4004-8f28-44813df4cba9" />

<img src="https://github.com/user-attachments/assets/1c0e16ed-24d7-4795-a77a-fce55f0757cf" />

<img src="https://github.com/user-attachments/assets/58f63cb4-786b-4067-bb6c-5ee4d679ee93" />

### Find Blogs using URL / Keywords

<img src="https://github.com/user-attachments/assets/671eccbb-4403-4aea-bc73-e6380c5b1107" />


### Stories
<img src="https://github.com/user-attachments/assets/dd6f8ea4-4624-43af-aecf-185baa6deeb0" />

<img src="https://github.com/user-attachments/assets/be4bf8d5-abe4-40b1-9137-bfdab6acf98f" />

### Status

<img src="https://github.com/user-attachments/assets/a7dcbccb-31ad-446a-a6a0-17a35b141506" />

### Following

<img src="https://github.com/user-attachments/assets/015f2488-7fee-41b0-bae5-4aea5c1d42f9" />

### Dashboard

<img src="https://github.com/user-attachments/assets/f2e702d5-b759-483e-93c6-ccb9e0798abe" />

### Settings

<img src="https://github.com/user-attachments/assets/c2b995f7-b8fd-41eb-bb82-2ec650e8a117" />

<img src="https://github.com/user-attachments/assets/310a9dd5-9539-42e0-877d-797b414e5499" />

---

# 🛠️ Admin Panel

### Dashboard

<img src="https://github.com/user-attachments/assets/5f80b32e-6880-45ef-922a-2e3ea7259067" />

### Run History

<img src="https://github.com/user-attachments/assets/ea2fc402-9a84-4b2e-ad7b-70e3175aec5d" />

<img src="https://github.com/user-attachments/assets/0730c104-4514-4c89-8e6a-43b5fb7888bc" />

### Articles

<img src="https://github.com/user-attachments/assets/fed9462c-ce4e-4f8f-ac4f-4c0feafbba29" />

### Themes

<img src="https://github.com/user-attachments/assets/2699bfca-60d0-4b6f-983d-545185b068ec" />

### Profiles

<img src="https://github.com/user-attachments/assets/773b47a4-2855-4dbd-8d1d-07afd297629e" />

<img src="https://github.com/user-attachments/assets/a5bdaa0b-cde6-4f63-b5e7-7876a8eb3a28" />

### Settings

<img src="https://github.com/user-attachments/assets/54ec5b2d-988b-490e-9d62-91699ed14178" />


## 🗂️ Project Structure

```
Curation/
└── blogcurate/
    ├── public/                   # Static assets
    ├── src/
    │   ├── assets/               # Images, fonts, icons
    │   ├── components/           # Reusable Svelte components
    │   │   └── EditorialProfileModal.svelte
    │   ├── data/                 # Static & mock data
    │   │   └── editorialProfiles.js
    │   ├── pages/
    │   │   └── admin/
    │   │       ├── EditorialProfilesManager.svelte
    │   │       ├── AdminShell.svelte
    │   │       └── AdminDashboard.svelte
    │   ├── stores/
    │   │   └── store.js          # Global state & actions
    │   ├── App.svelte            # Root component
    │   ├── app.css               # Global styles
    │   └── main.js               # App entry point
    ├── index.html
    ├── vite.config.js
    ├── svelte.config.js
    └── EDITORIAL_PROFILES_GUIDE.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Curation.git

# Navigate to the app directory
cd Curation/blogcurate

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_ADMIN_KEY` | Admin API key for authenticated requests |

---

## 🧠 Editorial Profiles System

One of the core features of BlogCurate is its **AI-powered editorial profile system**. Each content theme gets a weekly profile generated by analyzing the 50 most recent published articles.

Each profile includes:

- 🔑 **Dominant Keywords** — Frequency-ranked with sector mapping
- 🏭 **Covered Sectors** — Industry segments and growth trends
- ✍️ **Editorial Spirit** — A 50-word identity statement defining what makes an article worth publishing
- 📈 **Calibration Quality Score** — How accurately the profile predicts editorial decisions
- ❌ **Rejection Reasons** — Most common reasons articles are declined

> See [EDITORIAL_PROFILES_GUIDE.md](./blogcurate/EDITORIAL_PROFILES_GUIDE.md) for full implementation details and backend integration instructions.

### Backend Integration (API Endpoints)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/editorial-profiles` | Fetch all profiles |
| `GET` | `/api/editorial-profiles/:themeId` | Fetch profile for a theme |
| `POST` | `/api/editorial-profiles/:themeId/regenerate` | Trigger re-analysis |

---

## 👥 Team

| Name | Role |
|---|---|
| **Kavibharathi** | Frontend Development — UI, components, pages, Svelte stores; assisted in backend API integration and editorial data structuring |
| **Kaviya** | Backend Development — API design, data pipelines, database; collaborated on editorial profile data design |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Developed as part of a client project during an internship at <strong>Infinit Solutions</strong>, Vadavalli, Coimbatore.</p>
