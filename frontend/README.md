# 🌱 Smart Agriculture Marketplace

A premium, production-ready React.js agriculture marketplace frontend — connecting farmers directly to buyers across India.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar/          # Sticky navbar with search, cart, wishlist
│   ├── Footer/          # Full footer with newsletter
│   ├── Hero/            # Hero banner with stats counter
│   ├── Categories/      # 8-category grid
│   ├── Products/        # ProductCard + FeaturedProducts
│   ├── WhyChooseUs/     # 6-feature grid
│   ├── Dashboard/       # SaaS dashboard cards + AI banner
│   ├── MarketPrices/    # Live price cards with mini charts
│   └── SuccessStories/  # Slider with farmer testimonials
├── pages/
│   ├── Home/            # Landing page (all sections)
│   ├── Shop/            # Filtered product listing
│   ├── ProductDetail/   # Image gallery, farmer info, related
│   ├── FarmerProfile/   # Farmer bio, stats, gallery
│   ├── Cart/            # Cart with coupon & order summary
│   ├── AIChat/          # AI chatbot with suggestions
│   ├── About/           # Mission, team, timeline, impact
│   └── Contact/         # Form, map, social links
├── context/
│   └── CartContext.jsx  # Global cart + wishlist state
└── data/
    └── index.js         # All dummy data
```

---

## ✨ Features

- **Sticky Navbar** — blur background, scroll shadow, mobile hamburger
- **Hero Banner** — animated stats counter, particle effects, drone animation
- **Shop** — category, price, organic, rating filters + sort + pagination
- **Product Detail** — image gallery, quantity selector, reviews
- **Cart** — coupon system (FRESH10, AGRI20), order summary
- **AI Chat** — smart bot with context-aware farming responses
- **Farmer Profile** — cover, stats, gallery, product listing
- **Market Prices** — live-updating cards with SVG trend lines
- **Dashboard** — 6 SaaS-style IoT/AI cards
- **Success Stories** — testimonial slider

## 🎨 Tech Stack

| Tool | Usage |
|------|-------|
| React 18 | UI framework |
| Vite 5 | Build tool |
| React Router 6 | Client-side routing |
| Context API | Cart & wishlist state |
| CSS3 | Custom styling, animations |

## 🎨 Color Palette

| Name | Hex |
|------|-----|
| Primary Green | `#2E7D32` |
| Secondary Green | `#4CAF50` |
| Accent Green | `#81C784` |
| Background | `#F8FFF8` |
| Text Primary | `#1A1A1A` |

## 🔖 Coupon Codes (Cart Demo)

- `FRESH10` — 10% discount
- `AGRI20` — 20% discount

---

## 📱 Responsive Breakpoints

| Device | Width |
|--------|-------|
| Desktop | 1280px+ |
| Laptop | 1024px |
| Tablet | 768px |
| Mobile | 480px / 320px |

---

*Built with ❤️ for farmers across India*
