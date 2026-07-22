## Goal
Play enter AND exit animations on every route change within the `(app)` storefront (the pages that render Header/Footer + blocks like Policy), so navigating between pages animates out the old page and animates in the new one.

## Approach: persistent client wrapper keyed on `usePathname()`

`template.tsx` alone can't do exit animations (it remounts, losing the old subtree). Instead we wrap `children` in a persistent client component rendered by the layout, keyed on the pathname so `AnimatePresence` can animate old→new.

## Files to create / change

### 1. NEW — `source/components/layout/PageTransition.tsx`
- `'use client'`
- Imports `AnimatePresence`, `motion` from `motion/react` and `usePathname` from `next/navigation`.
- Renders `<AnimatePresence mode="wait">` wrapping `<motion.main key={pathname} initial="..." animate="..." exit="...">`.
- A simple fade + small vertical slide (opacity 0↔1, y ~8–16px), ~0.3s, easing consistent with the Header's `[0.16, 1, 0.3, 1]`.
- Forwards `children` and no extra props (keeps it generic).
- Defined as `Variants` at module scope (matches house style in `CallToAction`/`ProductGridItem`).

### 2. EDIT — `source/app/(wearjmk)/(app)/layout.tsx`
- Replace `<main>{children}</main>` with `<PageTransition>{children}</PageTransition>`.
- `PageTransition` itself renders the `<motion.main>`, so the `<main>` tag and its role are preserved.
- Layout stays a server component; only the new client wrapper carries the `'use client'` boundary.

## Scope & behavior
- Covers all routes under `(app)`: `[slug]` pages, shop, checkout, account, products. Header/Footer are in the layout outside `children`, so they persist and do NOT re-animate.
- Authentication routes (`(authentication)`) are in a separate layout — not affected unless you later want the same wrapper there.
- Uses existing `motion` dependency; no new packages.

## Caveats (will verify during implementation, not now)
- The `loading.tsx` in `(app)/(product-management)/shop` interacts with transitions; `mode="wait"` holds the old page until the new one mounts, which can briefly delay the Suspense fallback. If it looks wrong I'll switch to `mode="popLayout"` or default mode.
- Scroll restoration: because the old `main` animates out then the new one in, the browser's scroll position should still restore correctly; I'll check and add `scroll` handling only if needed.

## Out of scope
- Native View Transitions API (not used — motion keeps it consistent with the codebase).
- Animating the Policy block itself is already done from the previous task; this adds page-level transitions on top.