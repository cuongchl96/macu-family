# MacuFam Wealth Hub

Ứng dụng quản lý tài chính cá nhân/gia đình. Người dùng theo dõi tiết kiệm, bất động sản, đầu tư (vàng, chứng khoán, crypto), nguồn vốn, kế hoạch lương và quỹ.

## Tech Stack

**Frontend**
- React 18 + TypeScript, Vite, React Router v6
- shadcn/ui (Radix UI primitives) + Tailwind CSS
- Framer Motion (animations), Lucide React (icons)
- React Hook Form + Zod (form validation)

**Backend** (`/backend/`)
- FastAPI + Python, SQLAlchemy async, PostgreSQL
- Entry point: `backend/main.py`, app module: `backend/app/`

## Dev Commands

```bash
npm run dev      # Khởi động frontend (Vite)
npm run build    # Build production
npm run test     # Vitest
```

Backend: `cd backend && uvicorn main:app --reload`

## Cấu trúc Navigation

Định nghĩa trong `src/components/layout/NavigationLayout.tsx`.

`Page` type (dùng làm ID định tuyến):
```
dashboard | highlights | savings | capital | realestate |
investments-gold | investments-stock | investments-crypto |
salary-planning | funds | loans
```

Nhóm hiển thị:
- **Tổng quan**: Tổng quan (dashboard), Điểm nổi bật (highlights), Nguồn vốn (capital)
- **Tài sản & Đầu tư**: Tiết kiệm (savings), Vàng (investments-gold), Chứng khoán (investments-stock), Tiền số (investments-crypto), Bất động sản (realestate)
- **Mục tiêu chi tiêu**: Quỹ (funds) — sinking funds, tích lũy để chi tiêu có mục tiêu
- **Kế hoạch**: Kế hoạch tài chính (salary-planning)
- **Nợ phải trả**: Khoản vay (loans)

## Cấu trúc Components

```
src/
  pages/Index.tsx                    # Root page, WealthApp component
  components/
    layout/NavigationLayout.tsx      # Sidebar + routing shell
    dashboard/ExecutiveDashboard.tsx
    highlights/HighlightsModule.tsx
    savings/SavingsModule.tsx
    capital/CapitalModule.tsx
    realestate/RealEstateModule.tsx
    investments/GoldModule.tsx
    investments/StockModule.tsx
    investments/CryptoModule.tsx
    salary/SalaryPlanningModule.tsx
    funds/FundsModule.tsx
  contexts/
    WealthContext.tsx   # Global wealth data (savings, investments, real estate, goals, allocations)
    AuthContext.tsx     # PIN-based authentication
  types/wealth.ts       # TypeScript types cho toàn bộ domain
```

## Conventions

- `useWealth()` hook để truy cập toàn bộ wealth data và actions
- Tất cả giá trị tiền tệ hỗ trợ VND/USD (currency switcher trong sidebar)
- `hideValues` toggle để ẩn số tiền (privacy mode)
- Auth dùng PIN, không có password phức tạp
- Module nào có internal tabs thì dùng Radix UI `<Tabs>` từ `src/components/ui/tabs.tsx`
