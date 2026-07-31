# WearJMK

WearJMK is the commerce and content platform for **JMK Fashion**, an African fashion brand creating expressive, contemporary pieces. The storefront brings the collection, editorial content, customer accounts, checkout, and order management together in one application.

[Visit jmkfashion.com](https://jmkfashion.com) · [View the repository](https://github.com/westshgit/WEARJMK)

> The storefront is in active development. Product availability and launch information will be published on [jmkfashion.com](https://jmkfashion.com).

## A look at the collection

<p align="center">
  <img src="./media/1B9D01AD-6774-4FC7-83A6-6968F2D866B4.jpg" alt="A WearJMK printed full-length dress, shown from the front and back" width="720" />
</p>

## What the project includes

- A responsive product catalogue with categories, variants, pricing, stock, search, and filters
- Shopping carts for signed-in customers and guests
- Customer accounts, saved addresses, order history, and secure guest order lookup
- Checkout and NGN payments through Paystack
- Product, page, media, form, SEO, and navigation management through Payload CMS
- Drafts, previews, scheduled publishing, and on-demand content revalidation
- Reusable page blocks for campaigns, policies, showcases, carousels, and calls to action
- Integration and end-to-end test suites with Vitest and Playwright

## Technology

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/) and TypeScript
- [Payload CMS 3](https://payloadcms.com/) with the ecommerce, form builder, and SEO plugins
- SQLite for the current database adapter
- [Paystack](https://paystack.com/) for payments in Nigerian naira
- Tailwind CSS 4, shadcn/ui, Radix UI, and Embla Carousel

## How we run the project

The application lives in `source/`. Run every project command from that directory and use **pnpm** for scripts and package management. Although the repository contains a Bun lockfile, the team workflow is standardized on pnpm; do not mix package managers.

### Requirements

- Node.js `20.9.0` or newer is recommended (the package also supports Node `18.20.2`)
- pnpm
- A Paystack test account and secret key for checkout work

### Environment

Create `source/.env` and provide the required values below. Never commit real secrets.

```dotenv
NODE_ENV=development

PAYLOAD_SECRET=replace-with-a-long-random-secret
DATABASE_URL=file:./wearjmk.db
COMPANY_NAME=WearJMK
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
PREVIEW_SECRET=replace-with-a-preview-secret

PAYSTACK_SECRET_KEY=sk_test_replace_me
PAYSTACK_API_BASE_URL=https://api.paystack.co
PAYSTACK_REFERENCE_PREFIX=JMK
PAYSTACK_REQUEST_TIMEOUT_MS=10000

NEXT_PUBLIC_SITE_NAME=WearJMK
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_SUPPORT_WHATSAPP=2340000000000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SHOWCASE_PRODUCTS_LIMITS=8
```

Stripe variables exist as optional compatibility settings, but Paystack is the payment method currently registered by the ecommerce plugin.

### Install and start

```bash
cd source
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for Payload Admin. On a new database, use the admin screen to create the first administrator.

### Useful scripts

| Command              | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `bun dev`            | Start the local Next.js development server                             |
| `bun build:dev`      | Create a production-style build without the migration steps in `build` |
| `bun build`          | Create and run Payload migrations, then build Next.js                  |
| `bun start`          | Run migrations, then start the production server                       |
| `bun lint`           | Run ESLint                                                             |
| `bun test:int`       | Run the Vitest integration suite                                       |
| `bun test:e2e`       | Run the Playwright end-to-end suite                                    |
| `bun test`           | Run both test suites                                                   |
| `bun generate:types` | Regenerate Payload TypeScript types after an approved schema change    |

Do not point local migration or schema commands at production data. The `build` and `start` scripts perform migration work, so confirm the target database before running them.

## Project layout

```text
source/
├── access/       # Payload access-control policies
├── app/          # Storefront, account, checkout, and Payload routes
├── blocks/       # CMS page-building blocks
├── collections/  # Users, products, pages, categories, and media
├── components/   # Storefront and admin UI
├── globals/      # Site-wide CMS settings
├── lib/          # APIs, payments, schemas, and environment validation
├── migrations/   # Payload database migrations
├── plugins/      # Payload plugin configuration
├── tests/        # Integration and end-to-end tests
└── payload.config.ts
```

## Contributing

Contributions should be focused, reviewed, and consistent with the existing architecture.

1. Create a branch from the current development branch.
2. Read the repository instructions in `AGENTS.md` and the skills under `.agents/skills/` before changing code.
3. For Payload work, consult `.agents/skills/payload/reference/`; for Next.js behavior, use the version-matched guides under `node_modules/next/dist/docs/`.
4. Keep Client and Server Component import graphs separate. Client Components must import Server Actions directly from their `'use server'` modules.
5. Preserve Payload request context: nested operations in hooks must receive the original `req`, and revalidation hooks must respect `req.context.disableRevalidate`.
6. Never edit `payload-types.ts` manually. After an approved schema change, regenerate it with `pnpm generate:types`.
7. Do not introduce routes, services, dependencies, or other architectural boundaries without explicit approval.
8. Run only the checks relevant to your change, using pnpm from `source/`, and document what you verified in the pull request.

Before opening a pull request, make sure secrets and local data are excluded, explain any database or environment changes, and include screenshots for visible UI changes.

## License

WearJMK is licensed under the [MIT License](https://opensource.org/license/mit). The package metadata in `package.json` declares the project license as MIT.

## Links

- Website: [jmkfashion.com](https://jmkfashion.com)
- Source: [github.com/westshgit/WEARJMK](https://github.com/westshgit/WEARJMK)
- Payload documentation: [payloadcms.com/docs](https://payloadcms.com/docs)
