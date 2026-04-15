# Family Wealth Hub

A comprehensive dashboard application to manage, track, and analyze family wealth across various asset classes including savings, real estate, gold, and cryptocurrency.

## 🌟 Features

- **Executive Dashboard**: Get a bird's-eye view of your total net worth, liquid assets, and asset distribution.
- **Savings Module**: Track savings deposits across different banks (e.g., Techcombank, Tikop), calculate maturity dates, and monitor interest rates.
- **Real Estate Module**: Manage property investments, payment schedules, and track paid vs. pending contract amounts.
- **Gold Investments**: Monitor gold holdings and their current market value based on current and historical prices.
- **Crypto Investments**: Track cryptocurrency portfolio and deposits.
- **Multi-Owner Tracking**: Distinguish between joint assets and individual assets (e.g., husband, wife).
- **Currency Support**: Built-in support for VND with real-time conversion to USD.

## 💻 Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) featuring Radix UI primitives
- **Charts**: [Recharts](https://recharts.org/) for clean, responsive data visualization
- **State Management**: React Context (`WealthContext`) with mocked localized data management.
- **Routing**: [React Router](https://reactrouter.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1. Install dependencies:
   ```bash
   npm i
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the provided default local URL in your browser (usually `http://localhost:5173`).

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Login screen and authentication components
│   ├── dashboard/     # Main executive dashboard widgets
│   ├── investments/   # Gold and Crypto tracking modules
│   ├── layout/        # Core application layout and navigation
│   ├── realestate/    # Property and payment tracking 
│   ├── savings/       # Savings deposits and maturity tracking
│   └── ui/            # Reusable shadcn-ui components
├── contexts/          # React contexts (e.g., WealthContext for state)
├── data/              # Mock data source and financial utility functions (wealthData.ts)
├── hooks/             # Custom React hooks
├── pages/             # Route pages (Index.tsx, NotFound.tsx)
└── types/             # TypeScript type definitions for wealth models
```

## 📝 Modification and Customization

This project uses mock data provided in `src/data/wealthData.ts`. If you would like to connect this to a real backend, you can modify the hooks and the `WealthContext` to fetch from an API instead of returning the statically typed data.

## 📄 License

This project is private.
