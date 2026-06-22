# Wear JMK

A modern e-commerce platform built with Next.js, Payload CMS, and Stripe integration. This project combines a headless CMS with a full-featured storefront powered by React and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ with bun package manager
- SQLite (bundled with dependencies)
- Stripe account (for payment processing)

### Installation

```bash
# Install dependencies
pnpm install

# Generate types and import maps
pnpm run generate:types
pnpm run generate:importmap

# Set up environment variables (see .env setup below)
cp .env.example .env.local

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```code
WEARJMK/
├── app/                    # Next.js app directory (routes, layouts, API)
├── collections/            # Payload CMS collections (Products, Orders, etc.)
├── components/             # React components (UI, forms, features)
├── config/                 # Configuration files (Payload, Tailwind, etc.)
├── lib/                    # Utility functions and helpers
├── public/                 # Static assets
├── payload.config.ts       # Payload CMS configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Technology Stack

- **Framework:** Next.js 16.2.9 with React 19.2.4
- **CMS:** Payload CMS 3.85.1
- **Database:** SQLite
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Forms:** React Hook Form 7.71.1
- **Payment:** Stripe 22.2.2
- **E-commerce:** Payload e-commerce plugin
- **UI Components:** Radix UI, Lucide React icons, Embla Carousel
- **Testing:** Vitest, Playwright
- **Code Quality:** ESLint, Prettier, TypeScript 5

## 🌱 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Payload CMS
PAYLOAD_SECRET=your_long_secure_random_string_here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Database
DATABASE_URI=sqlite:./payload.db

# Email (Nodemailer)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM_NAME=Wear JMK
SMTP_FROM_EMAIL=noreply@wearjmk.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your_jwt_secret_here

# Optional: Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

## 📝 Available Scripts

```bash
# Development
pnpm run dev              # Start dev server at 0.0.0.0:3000
pnpm run dev:prod         # Production build & start

# Building & Deployment
pnpm run build            # Build for production
pnpm run start            # Start production server

# Code Quality
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Fix linting issues
pnpm run generate:types   # Generate Payload types
pnpm run generate:importmap  # Generate import map

# Testing
pnpm run test             # Run all tests
pnpm run test:int         # Run integration tests with Vitest
pnpm run test:e2e         # Run E2E tests with Playwright

# Other
pnpm run payload          # Payload CLI commands
pnpm run stripe-webhooks  # Listen to local Stripe webhooks
pnpm run reinstall        # Clean install
```

## 🛒 Key Features

- **E-commerce:** Full product catalog, cart, and checkout with Stripe
- **SEO:** Built-in SEO plugin for better search engine visibility
- **Live Preview:** Real-time preview of changes
- **Form Builder:** Payload plugin for custom form creation
- **Multi-language:** Built-in translations support
- **Admin Bar:** Payload admin bar for quick content editing
- **Rich Text:** Lexical editor for content creation
- **Dark Mode:** Next.js themes support with system preference detection

## 🔐 Security & Authentication

- JWT-based authentication
- Secure environment variable handling
- Stripe webhook verification
- CSRF protection via Next.js
- TypeScript for type safety

## 📚 Database

The project uses SQLite with Payload CMS. Database migrations and schema management are handled by Payload. The database file (`payload.db`) is created automatically in the root directory.

## 🎨 Styling

- **Tailwind CSS 4** for utility-first CSS
- **shadcn/ui** pre-built components
- **Tailwind Merge** for dynamic class handling
- **Prettier Tailwind Plugin** for consistent class ordering

## 🧪 Testing

- **Vitest:** Fast unit and integration testing
- **Playwright:** E2E testing with browser automation
- **jsdom:** DOM testing environment

## 📦 Deployment

### Vercel (Recommended)

```bash
pnpm run build
# Push to GitHub and deploy via Vercel dashboard
```

### Docker/Self-hosted

```bash
pnpm run build
pnpm run start
```

Ensure all `.env` variables are set in your hosting environment.

## 🐛 Troubleshooting

**Port 3000 already in use:**

```bash
pnpm run dev -- -p 3001
```

**Build memory issues:**
Increase Node memory: `NODE_OPTIONS="--max-old-space-size=8000"`

**Database issues:**

```bash
rm payload.db
pnpm run dev
```

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Payload CMS Docs](https://payloadcms.com)
- [Stripe API](https://stripe.com/docs/api)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## 📝 Notes for Next Developer

- **Payload Collections:** Define data models in `collections/` folder
- **API Routes:** Use Next.js app router in `app/api/`
- **Components:** Keep reusable UI components in `components/`
- **Styling:** Use Tailwind classes + shadcn components for consistency
- **Types:** Always generate types after schema changes: `pnpm run generate:types`
- **Testing:** Write tests in `__tests__/` folders alongside code
- **Linting:** Run `pnpm run lint:fix` before commits
- **Environment:** Never commit `.env.local` - use `.env.example`
- **Webhooks:** Stripe webhooks endpoint is at `/api/payments/stripe/webhooks`
- **Admin:** Access Payload admin at `http://localhost:3000/admin`

## 📄 License

Private project - Wear JMK
